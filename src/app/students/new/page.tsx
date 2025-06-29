'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().optional(),
  password: z.string().optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  mobileNumber: z.string().optional(),
  fatherName: z.string().optional(),
  fatherContact: z.string().optional(),
  motherName: z.string().optional(),
  motherContact: z.string().optional(),
  enrolledSubjectIds: z.array(z.string()).optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface Subject {
  id: string
  name: string
}

interface Grade {
  id: string
  name: string
  curriculum: string
  level: number
  isActive: boolean
}

export default function NewStudentPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')

  // Fetch subjects and grades on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/subjects').then(res => res.json()),
      fetch('/api/grades').then(res => res.json())
    ])
      .then(([subjectsData, gradesData]) => {
        setSubjects(subjectsData)
        setGrades(gradesData.filter((grade: Grade) => grade.isActive))
      })
      .catch(() => {
        setSubjects([])
        setGrades([])
      })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  })

  async function onSubmit(data: StudentFormData) {
    setError('')
    setLoading(true)

    const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    const defaultEmail = data.email || `${slugify(data.name)}@gmail.com`

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: defaultEmail,
          password: 'admin123',
          gradeId: selectedGradeId || null,
          enrolledSubjectIds: selectedSubjectIds,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create student')
      }

      router.push('/students')
      router.refresh()
    } catch {
      setError('Failed to create student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add New Student</h1>
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

          {/* Student Basic Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Grade
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a grade</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name} ({grade.curriculum})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  School
                </label>
                <input
                  type="text"
                  {...register('school')}
                  placeholder="School name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="tel"
                {...register('mobileNumber')}
                placeholder="+1234567890"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Name
                </label>
                <input
                  type="text"
                  {...register('fatherName')}
                  placeholder="Father's full name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Father's Contact
                </label>
                <input
                  type="tel"
                  {...register('fatherContact')}
                  placeholder="+1234567890"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Name
                </label>
                <input
                  type="text"
                  {...register('motherName')}
                  placeholder="Mother's full name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Contact
                </label>
                <input
                  type="tel"
                  {...register('motherContact')}
                  placeholder="+1234567890"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Subjects */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Subjects</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {subjects.map(subject => (
                <label key={subject.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSubjectIds.includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">{subject.name}</span>
                </label>
              ))}
              {subjects.length === 0 && (
                <p className="text-sm text-gray-500">No subjects available</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 