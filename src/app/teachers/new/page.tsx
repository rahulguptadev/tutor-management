'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout as Layout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Select from 'react-select'

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().optional(),
  password: z.string().optional(),
  phoneNumber: z.string().optional(),
  education: z.string().optional(),
  qualification: z.string().optional(),
  bio: z.string().optional(),
  availability: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

export default function NewTeacherPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [subjectsList, setSubjectsList] = useState<{ id: string; name: string }[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  // Fetch subjects on mount
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(setSubjectsList)
      .catch(() => setSubjectsList([]))
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  const subjectOptions = subjectsList.map(subject => ({ value: subject.id, label: subject.name }))

  async function onSubmit(data: TeacherFormData) {
    setError('')
    setLoading(true)

    if (selectedSubjectIds.length === 0) {
      setError('Please select at least one subject.')
      setLoading(false)
      return
    }

    const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    const defaultEmail = data.email || `${slugify(data.name)}@gmail.com`

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: defaultEmail,
          password: 'admin123',
          phoneNumber: data.phoneNumber || null,
          subjects: selectedSubjectIds,
          education: data.education || null,
          qualification: data.qualification || null,
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
              Phone Number (optional)
            </label>
            <input
              type="tel"
              {...register('phoneNumber')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subjects
            </label>
            <Select
              isMulti
              options={subjectOptions}
              value={subjectOptions.filter(opt => selectedSubjectIds.includes(opt.value))}
              onChange={selected => setSelectedSubjectIds(selected.map(opt => opt.value))}
              className="mt-1"
              classNamePrefix="react-select"
              placeholder="Select subjects..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Education
            </label>
            <input
              type="text"
              {...register('education')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Qualification
            </label>
            <input
              type="text"
              {...register('qualification')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
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