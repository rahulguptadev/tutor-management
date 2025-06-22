'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subjects: z.string().min(1, 'At least one subject is required'),
  hourlyRate: z.string().min(1, 'Hourly rate is required'),
  bio: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

interface EditTeacherFormProps {
  teacherId: string
}

export function EditTeacherForm({ teacherId }: EditTeacherFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<TeacherFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  useEffect(() => {
    async function fetchTeacher() {
      try {
        const response = await fetch(`/api/teachers/${teacherId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch teacher')
        }
        const data = await response.json()
        const formData = {
          name: data.user.name,
          email: data.user.email,
          subjects: data.subjects.join(', '),
          hourlyRate: data.hourlyRate.toString(),
          bio: data.bio || '',
        }
        setInitialData(formData)
        reset(formData)
      } catch {
        setError('Failed to load teacher details')
      }
    }
    fetchTeacher()
  }, [teacherId, reset])

  async function onSubmit(data: TeacherFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subjects: data.subjects.split(',').map(s => s.trim()),
          hourlyRate: parseFloat(data.hourlyRate),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update teacher')
      }

      router.push(`/teachers/${teacherId}`)
      router.refresh()
    } catch {
      setError('Failed to update teacher. Please try again.')
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
          <h1 className="text-2xl font-semibold">Edit Teacher</h1>
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
              Name
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
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subjects (comma-separated)
            </label>
            <input
              type="text"
              {...register('subjects')}
              placeholder="e.g., Mathematics, Physics, Chemistry"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.subjects && (
              <p className="mt-1 text-sm text-red-600">{errors.subjects.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hourly Rate (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('hourlyRate')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.hourlyRate && (
              <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              {...register('bio')}
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