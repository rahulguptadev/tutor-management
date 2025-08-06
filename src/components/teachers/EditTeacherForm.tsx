'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DashboardLayout } from '@/components/dashboard-layout'
import Select from 'react-select'

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().optional(),
  education: z.string().optional(),
  qualification: z.string().optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  bio: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

interface Subject {
  id: string
  name: string
}

interface EditTeacherFormProps {
  teacherId: string
}

export function EditTeacherForm({ teacherId }: EditTeacherFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<TeacherFormData | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/subjects')
        if (response.ok) {
          const data = await response.json()
          setSubjects(data)
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error)
      }
    }
    fetchSubjects()
  }, [])

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
          phoneNumber: data.phoneNumber || '',
          education: data.education || '',
          qualification: data.qualification || '',
          subjects: data.subjects,
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

  // Update selected subject IDs when subjects are loaded and teacher data is available
  useEffect(() => {
    if (subjects.length > 0 && initialData) {
      const subjectIds = initialData.subjects
        .map((subjectName: string) => {
          const subject = subjects.find(s => s.name === subjectName)
          return subject?.id || ''
        })
        .filter(id => id !== '')
      setSelectedSubjectIds(subjectIds)
    }
  }, [subjects, initialData])

  const subjectOptions = subjects.map(subject => ({ value: subject.id, label: subject.name }))

  async function onSubmit(data: TeacherFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phoneNumber: data.phoneNumber || null,
          subjects: selectedSubjectIds,
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
            {errors.subjects && (
              <p className="mt-1 text-sm text-red-600">{errors.subjects.message}</p>
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