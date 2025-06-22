'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout as Layout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  subjects: z.string().min(1, 'At least one subject is required'),
  hourlyRate: z.string().min(1, 'Hourly rate is required'),
  bio: z.string().optional(),
  availability: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

export default function NewTeacherPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  async function onSubmit(data: TeacherFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subjects: data.subjects.split(',').map(s => s.trim()),
          hourlyRate: parseFloat(data.hourlyRate),
          availability: data.availability ? JSON.parse(data.availability) : {},
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create teacher')
      }

      router.push('/teachers')
      router.refresh()
    } catch {
      setError('Failed to create teacher. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add New Teacher</h1>
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
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
              Hourly Rate ($)
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
            <label className="block text-sm font-medium text-gray-700">
              Availability (JSON)
            </label>
            <textarea
              {...register('availability')}
              placeholder='{"monday": ["9:00-12:00", "14:00-17:00"], "tuesday": ["9:00-12:00"]}'
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter availability as JSON. Example: {'{"monday": ["9:00-12:00", "14:00-17:00"]}'}
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
} 