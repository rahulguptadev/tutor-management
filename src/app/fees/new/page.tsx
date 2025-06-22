'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const feeSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  amount: z.string().min(1, 'Amount is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']),
})

type FeeFormData = z.infer<typeof feeSchema>

type Class = {
  id: string
  name: string
  subject: string
  fee: number
  teacher: {
    user: {
      name: string
    }
  }
  student: {
    user: {
      name: string
    }
  }
}

export default function NewFeePage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      status: 'PENDING',
    },
  })

  const watchClassId = watch('classId')

  useEffect(() => {
    // Fetch classes
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes')
        if (!response.ok) {
          throw new Error('Failed to fetch classes')
        }
        const data = await response.json()
        setClasses(data)
      } catch {
        setError('Failed to load classes')
      }
    }

    fetchClasses()
  }, [])

  useEffect(() => {
    // Update amount when class changes
    if (watchClassId) {
      const classItem = classes.find(c => c.id === watchClassId)
      setSelectedClass(classItem || null)
      if (classItem?.fee != null) {
        setValue('amount', classItem.fee.toString())
      }
    }
  }, [watchClassId, classes, setValue])

  async function onSubmit(data: FeeFormData) {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create fee')
      }

      router.push('/fees')
      router.refresh()
    } catch {
      setError('Failed to create fee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add New Fee</h1>
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
              Class
            </label>
            <select
              {...register('classId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a class</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.subject} ({classItem.teacher.user.name})
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
            )}
          </div>

          {selectedClass && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-700">Class Details</h3>
              <dl className="mt-2 space-y-1 text-sm text-gray-500">
                <div>
                  <dt className="inline font-medium">Teacher:</dt>
                  <dd className="inline ml-1">{selectedClass.teacher.user.name}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Student:</dt>
                  <dd className="inline ml-1">
                    {selectedClass.student?.user?.name || '-'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
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
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
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
              {loading ? 'Creating...' : 'Create Fee'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
} 