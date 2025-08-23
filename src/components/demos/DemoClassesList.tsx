'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DeleteButton } from '@/components/DeleteButton'

interface DemoClass {
  id: string
  studentName: string
  studentEmail: string
  studentPhone?: string
  scheduledDate: string
  scheduledTime: string
  status: string
  notes?: string
  teacher: {
    user: {
      name: string
    }
  }
  subject: {
    name: string
  }
  user: {
    name: string
  }
  createdAt: string
}

export function DemoClassesList() {
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState('7days')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchDemoClasses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (timeFilter) params.append('timeFilter', timeFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/demos?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch demo classes')
      }

      const data = await response.json()
      setDemoClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch demo classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemoClasses()
  }, [timeFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="1month">Last 1 month</option>
              <option value="3months">Last 3 months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Demo Classes Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Demo Classes</h3>
            <Link
              href="/demos/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Schedule New Demo
            </Link>
          </div>
        </div>

        {demoClasses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No demo classes found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {demoClasses.map((demoClass, idx) => (
                  <tr key={demoClass.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {demoClass.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {demoClass.studentEmail}
                        </div>
                        {demoClass.studentPhone && (
                          <div className="text-sm text-gray-500">
                            {demoClass.studentPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {demoClass.teacher.user.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {demoClass.subject.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{formatDate(demoClass.scheduledDate)}</div>
                        <div className="text-gray-500">{formatTime(demoClass.scheduledTime)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(demoClass.status)}`}>
                        {demoClass.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {demoClass.user.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/demos/${demoClass.id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/demos/${demoClass.id}/edit`}
                          className="text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          entityType="demo"
                          entityId={demoClass.id}
                          entityName={`${demoClass.subject.name} demo for ${demoClass.studentName}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 