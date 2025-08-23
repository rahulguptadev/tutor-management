'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Class = {
  id: string
  name: string
  subject: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  startTime: Date
  endTime: Date
  schedule: any
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

export default function ClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch classes data
  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccessMessage('')
      const response = await fetch('/api/classes', {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Classes data received:', data)
        console.log('First class subject:', data[0]?.subject)
        setClasses(data)
      } else if (response.status === 401) {
        setError('Authentication required. Please sign in again.')
        // Redirect to signin page
        window.location.href = '/auth/signin'
      } else {
        setError(`Failed to fetch classes: ${response.status}`)
      }
    } catch (err) {
      setError('Failed to fetch classes')
      console.error('Error fetching classes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchClasses()
  }, [])

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    // Refresh the data immediately after deletion
    fetchClasses()
    // Also refresh the router to update any cached data
    router.refresh()
    // Show success message
    setSuccessMessage('Class deleted successfully!')
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getStatusColor = (status: Class['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading classes...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchClasses}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <p className="text-sm text-gray-600 mt-1">Manage class schedules and assignments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchClasses}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Refreshing...
                </>
              ) : (
                '↻ Refresh'
              )}
            </button>
            <Link
              href="/classes/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
            >
              <span className="mr-2">+</span>
              Add Class
            </Link>
          </div>
        </div>
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {classes.map((classItem: any, idx: number) => (
                <tr key={classItem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    {classItem.subject?.name || '-'}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{classItem.teacher.user.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    {classItem.students && classItem.students.length > 0
                      ? classItem.students.map((cs: any) => cs.student.user.name).join(', ')
                      : '-'}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    {new Date(classItem.startTime).toLocaleDateString()} - {new Date(classItem.endTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(classItem.status)}`}>
                      {classItem.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/classes/${classItem.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/classes/${classItem.id}/edit`}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        entityType="class"
                        entityId={classItem.id}
                        entityName={`${classItem.subject?.name || 'Class'} with ${classItem.teacher.user.name}`}
                        onDelete={handleDeleteSuccess}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-3 text-center text-gray-500">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
} 