'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const payoutSchema = z.object({
  teacherId: z.string().min(1, 'Teacher is required'),
  classIds: z.array(z.string()).min(1, 'At least one class is required'),
})

type PayoutFormData = z.infer<typeof payoutSchema>

type Teacher = {
  id: string
  hourlyRate: number
  user: {
    name: string
  }
  classes: {
    id: string
    name: string
    subject: string
    duration: number
    students: {
      user: {
        name: string
      }
    }[]
  }[]
}

export default function NewPayoutPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<Teacher['classes']>([])
  const [totalAmount, setTotalAmount] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
  })

  const watchTeacherId = watch('teacherId')
  const watchClassIds = watch('classIds')

  useEffect(() => {
    // Fetch teachers with their classes
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers?includeClasses=true')
        if (!response.ok) {
          throw new Error('Failed to fetch teachers')
        }
        const data = await response.json()
        setTeachers(data)
      } catch {
        setError('Failed to load teachers')
      }
    }

    fetchTeachers()
  }, [])

  useEffect(() => {
    // Update selected teacher when teacher changes
    if (watchTeacherId) {
      const teacher = teachers.find(t => t.id === watchTeacherId)
      setSelectedTeacher(teacher || null)
      setSelectedClasses([])
      setValue('classIds', [])
    }
  }, [watchTeacherId, teachers, setValue])

  useEffect(() => {
    // Update selected classes and calculate total amount
    if (watchClassIds && selectedTeacher) {
      const classes = selectedTeacher.classes.filter(c => 
        watchClassIds.includes(c.id)
      )
      setSelectedClasses(classes)
      
      const total = classes.reduce((sum, classItem) => 
        sum + (classItem.duration * selectedTeacher.hourlyRate), 0
      )
      setTotalAmount(total)
    }
  }, [watchClassIds, selectedTeacher])

  async function onSubmit(data: PayoutFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: totalAmount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payout')
      }

      router.push('/payouts')
      router.refresh()
    } catch {
      setError('Failed to create payout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Create New Payout</h1>
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
              Teacher
            </label>
            <select
              {...register('teacherId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name} (${teacher.hourlyRate}/hr)
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
            )}
          </div>

          {selectedTeacher && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Classes
              </label>
              <div className="mt-2 space-y-2">
                {selectedTeacher.classes.map(classItem => (
                  <div key={classItem.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={classItem.id}
                      {...register('classIds')}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {classItem.name} ({classItem.subject}) - {classItem.duration} hours
                      <span className="text-gray-500 ml-2">
                        (${(classItem.duration * selectedTeacher.hourlyRate).toFixed(2)})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {errors.classIds && (
                <p className="mt-1 text-sm text-red-600">{errors.classIds.message}</p>
              )}
            </div>
          )}

          {selectedClasses.length > 0 && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-700">Payout Summary</h3>
              <dl className="mt-2 space-y-1 text-sm text-gray-500">
                <div>
                  <dt className="inline font-medium">Total Hours:</dt>
                  <dd className="inline ml-1">
                    {selectedClasses.reduce((sum, c) => sum + c.duration, 0)} hours
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">Hourly Rate:</dt>
                  <dd className="inline ml-1">
                    ${selectedTeacher?.hourlyRate.toFixed(2)}/hr
                  </dd>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <dt className="inline font-medium text-gray-700">Total Amount:</dt>
                  <dd className="inline ml-1 text-lg font-semibold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || selectedClasses.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Payout'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 