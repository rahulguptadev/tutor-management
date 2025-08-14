import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, User, BookOpen, MapPin, Mail, GraduationCap, Users, Calendar, Edit, ArrowLeft } from 'lucide-react'

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
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return '⏰'
      case 'IN_PROGRESS':
        return '🔄'
      case 'COMPLETED':
        return '✅'
      case 'CANCELLED':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {classData.subject?.name || 'Class'} Details
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Class ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{classData.id}</span>
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-3 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(classData.status)}`}>
                  <span className="mr-2">{getStatusIcon(classData.status)}</span>
                  {classData.status}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(classData.startTime)} at {formatTime(classData.startTime)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                href={`/classes/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Class
              </Link>
              <Link
                href="/classes"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classes
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Class Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Enhanced Class Information */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-blue-600" />
                  Class Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Subject</span>
                      <span className="font-semibold text-gray-900">{classData.subject?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Duration</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round((new Date(classData.endTime).getTime() - new Date(classData.startTime).getTime()) / (1000 * 60))} minutes
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Start Time</span>
                      <span className="font-semibold text-gray-900">{formatTime(classData.startTime)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">End Time</span>
                      <span className="font-semibold text-gray-900">{formatTime(classData.endTime)}</span>
                    </div>
                  </div>
                </div>
                
                {classData.isRecurring && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Recurring Schedule</span>
                    </div>
                    <p className="text-blue-800">
                      Pattern: <span className="font-semibold">{classData.recurrence || 'Custom'}</span>
                    </p>
                  </div>
                )}
                
                {classData.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{classData.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Teacher Information */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-3 text-green-600" />
                  Teacher Information
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{classData.teacher.user.name}</h3>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{classData.teacher.user.email}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Subjects Taught</span>
                        <div className="mt-1">
                          {classData.teacher.subjects.map((s, index) => (
                            <span key={s.subject.name} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                              {s.subject.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {classData.teacher.bio && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Bio</span>
                          <p className="mt-1 text-sm text-gray-700">{classData.teacher.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Students and Schedule */}
          <div className="space-y-6">
            {/* Enhanced Students List */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-600" />
                  Enrolled Students ({classData.students.length})
                </h2>
              </div>
              <div className="p-6">
                {classData.students.length > 0 ? (
                  <div className="space-y-4">
                    {classData.students.map((enrollment) => (
                      <div key={enrollment.student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {enrollment.student.user.name || 'Unnamed Student'}
                            </h3>
                            <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{enrollment.student.user.email || 'No email'}</span>
                            </div>
                            {enrollment.student.grade && (
                              <div className="flex items-center space-x-2 text-gray-500 text-sm mt-1">
                                <GraduationCap className="w-3 h-3" />
                                <span>{enrollment.student.grade.name} ({enrollment.student.grade.curriculum})</span>
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/students/${enrollment.student.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No students enrolled in this class.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Schedule Details */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-amber-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                  Schedule Details
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(classData.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">
                        {Math.round((new Date(classData.endTime).getTime() - new Date(classData.startTime).getTime()) / (1000 * 60))} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/classes/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Class
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Classes
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 