import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AttendanceForm } from '@/components/attendance/AttendanceForm'
import { CalendarDays, Clock, User, BookOpen } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  const { date } = await searchParams
  const selectedDate = date ? new Date(date) : new Date()
  
  // Format date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Get classes scheduled for the selected date
  const scheduledClasses = await prisma.class.findMany({
    where: {
      isActive: true,
      startTime: {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
    },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      subject: {
        select: {
          name: true,
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
            },
          },
        },
      },
      attendance: {
        where: {
          date: {
            gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          studentAttendance: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800'
      case 'ABSENT':
        return 'bg-red-100 text-red-800'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalendarDays className="w-6 h-6 mr-2" />
              Daily Attendance
            </h1>
            <p className="text-gray-600 mt-1">
              {formattedDate}
            </p>
          </div>
          <div className="flex space-x-3">
            <a
              href={`/attendance?date=${new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Previous Day
            </a>
            <a
              href={`/attendance?date=${new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next Day
            </a>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white shadow rounded-lg p-6">
          <form method="get" className="flex items-center space-x-4">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={selectedDate.toISOString().split('T')[0]}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Classes
            </button>
          </form>
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          {scheduledClasses.length > 0 ? (
            scheduledClasses.map((classItem) => (
              <div key={classItem.id} className="bg-white shadow rounded-lg">
                {/* Class Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {classItem.subject.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                          {classItem.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {classItem.teacher.user.name}
                        </div>
                        <div>
                          {classItem.students.length} student{classItem.students.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Form */}
                <div className="px-6 py-4">
                  <AttendanceForm 
                    classId={classItem.id}
                    classData={classItem}
                    selectedDate={selectedDate}
                    existingAttendance={classItem.attendance[0]}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Classes Scheduled
              </h3>
              <p className="text-gray-600">
                There are no classes scheduled for {formattedDate}.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 