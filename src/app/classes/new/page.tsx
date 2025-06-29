'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const classSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  studentIds: z.array(z.string()).min(1, 'At least one student is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  fee: z.string().min(1, 'Fee is required'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']),
})

type ClassFormData = z.infer<typeof classSchema>

type Teacher = {
  id: string
  user: {
    name: string
  }
  subjects: string[]
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
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      status: 'SCHEDULED',
      studentIds: [],
    },
  })

  const watchTeacherId = watch('teacherId')

  useEffect(() => {
    // Fetch teachers and students
    const fetchData = async () => {
      try {
        const [teachersRes, studentsRes] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/students'),
        ])

        if (!teachersRes.ok || !studentsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [teachersData, studentsData] = await Promise.all([
          teachersRes.json(),
          studentsRes.json(),
        ])

        setTeachers(teachersData)
        setStudents(studentsData)
      } catch {
        setError('Failed to load teachers and students')
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Update available subjects when teacher changes
    if (watchTeacherId) {
      const teacher = teachers.find(t => t.id === watchTeacherId)
      setSelectedTeacher(teacher || null)
    }
  }, [watchTeacherId, teachers])

  async function onSubmit(data: ClassFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fee: parseFloat(data.fee),
          schedule: JSON.parse(data.schedule),
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
            <input
              type="text"
              {...register('subject')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              list="subject-list"
            />
            {selectedTeacher && (
              <datalist id="subject-list">
                {selectedTeacher.subjects.map(subject => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            )}
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
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
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name} ({(teacher.subjects ?? []).join(', ')})
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
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {students.map(student => (
                <label key={student.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={student.id}
                    {...register('studentIds')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{student.user.name}</span>
                </label>
              ))}
            </div>
            {errors.studentIds && (
              <p className="mt-1 text-sm text-red-600">{errors.studentIds.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
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
              Schedule (JSON)
            </label>
            <textarea
              {...register('schedule')}
              placeholder='{"monday": "10:00-11:00", "wednesday": "10:00-11:00"}'
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter schedule as JSON. Example: {'{"monday": "10:00-11:00", "wednesday": "10:00-11:00"}'}
            </p>
            {errors.schedule && (
              <p className="mt-1 text-sm text-red-600">{errors.schedule.message}</p>
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