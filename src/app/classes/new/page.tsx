'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Select from 'react-select'
import dynamic from 'next/dynamic'

const StudentsSelect = dynamic(() => import('@/components/classes/StudentsSelect'), { ssr: false })

const classSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  studentIds: z.array(z.string()).min(1, 'At least one student is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  fee: z.string().min(1, 'Fee is required'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']),
  isRecurring: z.boolean(),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
  recurrenceEnd: z.string().optional(),
})

type ClassFormData = z.infer<typeof classSchema>

type Teacher = {
  id: string
  user: {
    name: string
  }
  subjects: { subject: { id: string; name: string } }[]
}

type Student = {
  id: string
  user: {
    name: string
  }
}

export default function NewClassPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ]
  const [scheduleRows, setScheduleRows] = useState([
    { day: '', start: '', end: '' },
  ])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      status: 'SCHEDULED',
      studentIds: [],
      isRecurring: false,
    },
  })

  const watchSubjectId = watch('subjectId')

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, studentsRes, subjectsRes] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/students'),
          fetch('/api/subjects'),
        ])

        if (!teachersRes.ok || !studentsRes.ok || !subjectsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [teachersData, studentsData, subjectsData] = await Promise.all([
          teachersRes.json(),
          studentsRes.json(),
          subjectsRes.json(),
        ])

        setTeachers(teachersData)
        setStudents(studentsData)
        setSubjects(subjectsData)
      } catch {
        setError('Failed to load teachers, students, or subjects')
      }
    }

    fetchData()
  }, [])

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    // This function is no longer needed as schedule is handled by state
  }

  async function onSubmit(data: ClassFormData) {
    setError('')
    setLoading(true)

    try {
      // Validate that schedule rows have all required data
      const validScheduleRows = scheduleRows.filter(row => row.day && row.start && row.end)
      if (validScheduleRows.length === 0) {
        setError('Please add at least one valid schedule entry with day, start time, and end time')
        setLoading(false)
        return
      }

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fee: parseFloat(data.fee),
          schedule: validScheduleRows, // Send schedule as structured data
          startTime: new Date(data.startDate).toISOString(),
          endTime: new Date(data.endDate).toISOString(),
          isRecurring: data.isRecurring,
          recurrence: data.isRecurring ? data.recurrence : undefined,
          recurrenceEnd: data.isRecurring && data.recurrenceEnd ? new Date(data.recurrenceEnd).toISOString() : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create class')
      }

      router.push('/classes')
      router.refresh()
    } catch {
      setError('Failed to create class. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter teachers by selected subject
  const filteredTeachers = watchSubjectId
    ? teachers.filter(teacher =>
        teacher.subjects.some(s => s.subject.id === watchSubjectId)
      )
    : teachers

  // Add this helper to map students to react-select options
  const studentOptions = students.map(student => ({ value: student.id, label: student.user.name }))

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add New Class</h1>
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
              Class Name
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              {...register('subjectId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
            )}
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
              {filteredTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name} ({teacher.subjects.map(s => s.subject.name).join(', ')})
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Students
            </label>
            <StudentsSelect
              options={studentOptions}
              value={studentOptions.filter(option => watch('studentIds').includes(option.value))}
              onChange={selected => {
                const ids = selected ? selected.map((s: any) => s.value) : []
                setValue('studentIds', ids, { shouldValidate: true })
              }}
              errors={errors.studentIds}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('startDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('endDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Schedule
            </label>
            <div className="space-y-2">
              {scheduleRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={row.day}
                    onChange={e => {
                      const newRows = [...scheduleRows]
                      newRows[idx].day = e.target.value
                      setScheduleRows(newRows)
                    }}
                  >
                    <option value="">Day</option>
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="border rounded px-2 py-1"
                    value={row.start}
                    onChange={e => {
                      const newRows = [...scheduleRows]
                      newRows[idx].start = e.target.value
                      setScheduleRows(newRows)
                    }}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    className="border rounded px-2 py-1"
                    value={row.end}
                    onChange={e => {
                      const newRows = [...scheduleRows]
                      newRows[idx].end = e.target.value
                      setScheduleRows(newRows)
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-500 px-2"
                    onClick={() => setScheduleRows(scheduleRows.filter((_, i) => i !== idx))}
                    disabled={scheduleRows.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 underline text-sm"
                onClick={() => setScheduleRows([...scheduleRows, { day: '', start: '', end: '' }])}
              >
                + Add Row
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                {...register('isRecurring')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700">
                This is a recurring class
              </label>
            </div>

            {watch('isRecurring') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recurrence Type
                  </label>
                  <select
                    {...register('recurrence')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select recurrence type</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                  {errors.recurrence && (
                    <p className="mt-1 text-sm text-red-600">{errors.recurrence.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recurrence End Date
                  </label>
                  <input
                    type="date"
                    {...register('recurrenceEnd')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {errors.recurrenceEnd && (
                    <p className="mt-1 text-sm text-red-600">{errors.recurrenceEnd.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('fee')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.fee && (
              <p className="mt-1 text-sm text-red-600">{errors.fee.message}</p>
            )}
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
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 