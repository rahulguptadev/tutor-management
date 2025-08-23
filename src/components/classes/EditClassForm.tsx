'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BookOpen, Calendar } from 'lucide-react'

const classSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  studentId: z.string().min(1, 'Student is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  isRecurring: z.boolean(),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'NONE']).optional(),
  recurrenceEnd: z.string().optional(),
  notes: z.string().optional(),
})

type ClassFormData = z.infer<typeof classSchema>

interface Teacher {
  id: string
  user: {
    name: string
  }
  subjects: string[]
}

interface Student {
  id: string
  user: {
    name: string
  }
}

interface Subject {
  id: string
  name: string
}

interface EditClassFormProps {
  classId: string
}

export function EditClassForm({ classId }: EditClassFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<ClassFormData | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [scheduleData, setScheduleData] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  })

  const watchIsRecurring = watch('isRecurring')

  useEffect(() => {
    // Fetch class details, teachers, students, and subjects
    const fetchData = async () => {
      try {
        console.log('Fetching data for class:', classId)
        const [classRes, teachersRes, studentsRes, subjectsRes] = await Promise.all([
          fetch(`/api/classes/${classId}`),
          fetch('/api/teachers'),
          fetch('/api/students'),
          fetch('/api/subjects'),
        ])

        if (!classRes.ok || !teachersRes.ok || !studentsRes.ok || !subjectsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [classData, teachersData, studentsData, subjectsData] = await Promise.all([
          classRes.json(),
          teachersRes.json(),
          subjectsRes.json(),
          studentsRes.json(),
        ])

        console.log('Fetched class data:', classData)
        console.log('Fetched teachers:', teachersData)
        console.log('Fetched students:', studentsData)
        console.log('Fetched subjects:', subjectsData)

        // Ensure data is in correct format before setting state
        setTeachers(Array.isArray(teachersData) ? teachersData : [])
        setStudents(Array.isArray(studentsData) ? studentsData : [])
        setSubjects(Array.isArray(subjectsData) ? subjectsData : [])

        // Extract schedule data if it exists
        if (classData.schedule && Array.isArray(classData.schedule)) {
          setScheduleData(classData.schedule)
        } else {
          setScheduleData([])
        }

        // Format the data for the form
        const formattedData: ClassFormData = {
          subjectId: classData.subjectId,
          teacherId: classData.teacherId,
          studentId: classData.students?.[0]?.student?.id || '',
          startTime: classData.startTime ? new Date(classData.startTime).toISOString().slice(0, 16) : '',
          endTime: classData.endTime ? new Date(classData.endTime).toISOString().slice(0, 16) : '',
          status: classData.status,
          isRecurring: classData.isRecurring || false,
          recurrence: classData.recurrence || undefined,
          recurrenceEnd: classData.recurrenceEnd ? new Date(classData.recurrenceEnd).toISOString().slice(0, 16) : '',
          notes: classData.notes || '',
        }

        console.log('Formatted form data:', formattedData)
        setInitialData(formattedData)
        reset(formattedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [classId, reset])

  async function onSubmit(data: ClassFormData) {
    setError('')
    setLoading(true)

    try {
      // Collect schedule data from the form inputs
      const scheduleInputs = document.querySelectorAll('input[type="time"]')
      const newScheduleData: any[] = []
      
      for (let i = 0; i < scheduleInputs.length; i += 2) {
        const dayIndex = Math.floor(i / 2)
        const day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][dayIndex]
        const startTime = (scheduleInputs[i] as HTMLInputElement).value
        const endTime = (scheduleInputs[i + 1] as HTMLInputElement).value
        
        if (startTime && endTime) {
          newScheduleData.push({
            day,
            start: startTime,
            end: endTime
          })
        }
      }

      console.log('Collected schedule data:', newScheduleData)
      console.log('Submitting form data:', data)
      
      const response = await fetch('/api/classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classId,
          ...data,
          schedule: newScheduleData,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to update class: ${errorText}`)
      }

      const result = await response.json()
      console.log('Update successful:', result)

      router.push(`/classes/${classId}`)
      router.refresh()
    } catch (error) {
      console.error('Form submission error:', error)
      setError('Failed to update class. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!initialData) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-6">
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
                <p className="text-gray-600 mt-1">Update class information and settings</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Information Section */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-3 text-blue-600" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    {...register('subjectId')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher
                  </label>
                  <select
                    {...register('teacherId')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.user?.name || 'Unknown Teacher'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student
                  </label>
                  <select
                    {...register('studentId')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.user?.name || 'Unknown Student'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                Schedule
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    {...register('startTime')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    {...register('endTime')}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Weekly Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Weekly Schedule
                </label>
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const existingSchedule = scheduleData.find(s => s.day === day)
                    return (
                      <div key={day} className="flex items-center space-x-3">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                        </div>
                        <input
                          type="time"
                          className="border rounded px-3 py-2 text-sm"
                          placeholder="Start time"
                          defaultValue={existingSchedule?.start || ''}
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          className="border rounded px-3 py-2 text-sm"
                          placeholder="End time"
                          defaultValue={existingSchedule?.end || ''}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <input
                  type="checkbox"
                  {...register('isRecurring')}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-orange-900">Recurring Class</span>
              </div>

              {watchIsRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-orange-900 mb-2">
                      Recurrence Pattern
                    </label>
                    <select
                      {...register('recurrence')}
                      className="block w-full rounded-lg border border-orange-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="BIWEEKLY">Bi-weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-900 mb-2">
                      Recurrence End Date
                    </label>
                    <input
                      type="datetime-local"
                      {...register('recurrenceEnd')}
                      className="block w-full rounded-lg border border-orange-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-3 text-green-600" />
                Additional Information
              </h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Add any additional notes about this class..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 