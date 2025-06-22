'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const classSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
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
    // Fetch class details, teachers, and students
    const fetchData = async () => {
      try {
        const [classRes, teachersRes, studentsRes] = await Promise.all([
          fetch(`/api/classes/${classId}`),
          fetch('/api/teachers'),
          fetch('/api/students'),
        ])

        if (!classRes.ok || !teachersRes.ok || !studentsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [classData, teachersData, studentsData] = await Promise.all([
          classRes.json(),
          teachersRes.json(),
          studentsRes.json(),
        ])

        setTeachers(teachersData)
        setStudents(studentsData)

        // Format class data for the form
        const formData = {
          subject: classData.subject,
          teacherId: classData.teacherId,
          studentId: classData.studentId,
          startTime: new Date(classData.startTime).toISOString().slice(0, 16),
          endTime: new Date(classData.endTime).toISOString().slice(0, 16),
          status: classData.status,
          isRecurring: classData.isRecurring,
          recurrence: classData.recurrence || undefined,
          recurrenceEnd: classData.recurrenceEnd ? new Date(classData.recurrenceEnd).toISOString().slice(0, 16) : undefined,
          notes: classData.notes || '',
        }

        setInitialData(formData)
        reset(formData)
      } catch {
        setError('Failed to load class details')
      }
    }

    fetchData()
  }, [classId, reset])

  async function onSubmit(data: ClassFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classId,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update class')
      }

      router.push(`/classes/${classId}`)
      router.refresh()
    } catch {
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
      <div className="max-w-2xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Class</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded shadow">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              {...register('subject')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teacher
            </label>
            <select
              {...register('teacherId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student
            </label>
            <select
              {...register('studentId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="datetime-local"
                {...register('startTime')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="datetime-local"
                {...register('endTime')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Recurring Class</span>
            </label>
          </div>

          {watchIsRecurring && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recurrence Pattern
                </label>
                <select
                  {...register('recurrence')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recurrence End Date
                </label>
                <input
                  type="datetime-local"
                  {...register('recurrenceEnd')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 