'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const demoClassSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  studentEmail: z.string().email('Valid email is required'),
  studentPhone: z.string().optional(),
  teacherId: z.string().min(1, 'Teacher is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
})

type DemoClassFormData = z.infer<typeof demoClassSchema>

interface Teacher {
  id: string
  user: {
    name: string
  }
  subjects: {
    subject: {
      id: string
      name: string
    }
  }[]
}

interface Subject {
  id: string
  name: string
}

export function CreateDemoClassForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DemoClassFormData>({
    resolver: zodResolver(demoClassSchema),
  })

  const watchedTeacherId = watch('teacherId')
  const watchedSubjectId = watch('subjectId')

  // Filter teachers by selected subject
  const filteredTeachers = watchedSubjectId
    ? teachers.filter(teacher =>
        teacher.subjects?.some(s => s.subject.id === watchedSubjectId)
      )
    : teachers

  // Reset teacher selection in form state when subject changes
  useEffect(() => {
    setValue('teacherId', '')
  }, [watchedSubjectId, setValue])

  useEffect(() => {
    // Fetch teachers and subjects
    const fetchData = async () => {
      try {
        const [teachersRes, subjectsRes] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/subjects'),
        ])

        if (teachersRes.ok) {
          const teachersData = await teachersRes.json()
          setTeachers(teachersData)
        }

        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json()
          setSubjects(subjectsData)
        }
      } catch (err) {
        setError('Failed to load teachers and subjects')
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (watchedTeacherId) {
      const teacher = teachers.find(t => t.id === watchedTeacherId)
      setSelectedTeacher(teacher || null)
    } else {
      setSelectedTeacher(null)
    }
  }, [watchedTeacherId, teachers])

  const onSubmit = async (data: DemoClassFormData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create demo class')
      }

      router.push('/demos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create demo class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Schedule Demo Class</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student Name *
              </label>
              <input
                type="text"
                {...register('studentName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.studentName && (
                <p className="mt-1 text-sm text-red-600">{errors.studentName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student Email *
              </label>
              <input
                type="email"
                {...register('studentEmail')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.studentEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.studentEmail.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student Phone (optional)
            </label>
            <input
              type="tel"
              {...register('studentPhone')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Subject Selection - moved above Teacher Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <select
              {...register('subjectId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
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

          {/* Teacher Selection - now filtered by subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teacher *
            </label>
            <select
              {...register('teacherId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a teacher</option>
              {filteredTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                {...register('scheduledDate')}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                type="time"
                {...register('scheduledTime')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes about the demo class..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Demo Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 