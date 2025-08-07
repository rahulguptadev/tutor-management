import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, DollarSign, User, BookOpen, MapPin } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          subjects: {
            include: {
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      students: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              grade: {
                select: {
                  name: true,
                  curriculum: true,
                },
              },
            },
          },
        },
      },
      subject: {
        select: {
          name: true,
          description: true,
        },
      },
    },
  })

  if (!classData) {
    notFound()
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classData.subject?.name || 'Class'} Details
            </h1>
            <p className="text-gray-600 mt-1">
              Class ID: {classData.id}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/classes/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Class
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Classes
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(classData.status)}`}>
            {classData.status}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Class Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Class Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{classData.subject?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{classData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-medium">
                    {formatDate(classData.startTime)} at {formatTime(classData.startTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {Math.round((new Date(classData.endTime).getTime() - new Date(classData.startTime).getTime()) / (1000 * 60))} minutes
                  </span>
                </div>
                {classData.isRecurring && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recurring:</span>
                    <span className="font-medium">Yes ({classData.recurrence})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teacher Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Teacher Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{classData.teacher.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{classData.teacher.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subjects:</span>
                  <span className="font-medium">
                    {classData.teacher.subjects.map(s => s.subject.name).join(', ')}
                  </span>
                </div>
                {classData.teacher.bio && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bio:</span>
                    <span className="font-medium max-w-xs text-right">{classData.teacher.bio}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Students */}
          <div className="space-y-6">
            {/* Students List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Enrolled Students ({classData.students.length})
              </h2>
              {classData.students.length > 0 ? (
                <div className="space-y-3">
                  {classData.students.map((enrollment) => (
                    <div key={enrollment.student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {enrollment.student.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {enrollment.student.user.email}
                          </p>
                          {enrollment.student.grade && (
                            <p className="text-sm text-gray-500">
                              Grade: {enrollment.student.grade.name} ({enrollment.student.grade.curriculum})
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/students/${enrollment.student.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No students enrolled in this class.
                </p>
              )}
            </div>

            {/* Schedule Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                Schedule Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(classData.startTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                    </p>
                  </div>
                </div>
                {classData.isRecurring && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Recurring Schedule</p>
                      <p className="text-sm text-gray-600">
                        {classData.recurrence || 'Custom schedule configured'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex space-x-3">
            <Link
              href={`/classes/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Class
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Classes
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 