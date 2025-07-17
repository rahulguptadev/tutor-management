import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ActivityTimeline } from '@/components/activity-timeline'
import { CalendarView } from '@/components/calendar-view'
import { QuickActions } from '@/components/quick-actions'
import Link from 'next/link'

type DashboardStats = {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalLeads: number
  pendingFees: number
  pendingPayouts: number
  upcomingClasses: {
    id: string
    startTime: Date
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
    subject: {
      name: string
    }
  }[]
  recentLeads: {
    id: string
    name: string
    email: string
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
    createdAt: Date
  }[]
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch dashboard statistics
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalLeads,
    pendingFees,
    pendingPayouts,
    upcomingClasses,
    recentLeads,
    activities,
    allClasses,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.lead.count(),
    prisma.fee.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    }),
    prisma.class.findMany({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        startTime: true,
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        students: {
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    }),
    prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.activity.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
    prisma.class.findMany({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    }),
  ])

  const stats: DashboardStats = {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalLeads,
    pendingFees: pendingFees._sum.amount || 0,
    pendingPayouts: pendingPayouts._sum.amount || 0,
    upcomingClasses,
    recentLeads: recentLeads.map((lead: { id: string; status: string; createdAt: Date; user?: { name: string; email: string } }) => ({
      id: lead.id,
      name: lead.user?.name || '',
      email: lead.user?.email || '',
      status: lead.status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST',
      createdAt: lead.createdAt,
    })),
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* Quick Actions */}
        <QuickActions />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.totalStudents}
            </p>
            <Link
              href="/students"
              className="mt-4 text-sm text-blue-600 hover:text-blue-900"
            >
              View all students →
            </Link>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Teachers</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.totalTeachers}
            </p>
            <Link
              href="/teachers"
              className="mt-4 text-sm text-blue-600 hover:text-blue-900"
            >
              View all teachers →
            </Link>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Classes</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.totalClasses}
            </p>
            <Link
              href="/classes"
              className="mt-4 text-sm text-blue-600 hover:text-blue-900"
            >
              View all classes →
            </Link>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.totalLeads}
            </p>
            <Link
              href="/leads"
              className="mt-4 text-sm text-blue-600 hover:text-blue-900"
            >
              View all leads →
            </Link>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Fees</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ₹{stats.pendingFees.toLocaleString()}
            </p>
            <Link
              href="/fees"
              className="mt-4 text-sm text-blue-600 hover:text-blue-900"
            >
              View all fees →
            </Link>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              ₹{stats.pendingPayouts.toLocaleString()}
            </p>
            <Link
              href="/payouts"
              className="mt-4 text-sm text-blue-600 hover:text-blue-900"
            >
              View all payouts →
            </Link>
          </div>
        </div>

        {/* Calendar and Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CalendarView classes={allClasses.map((class_: any) => ({
            ...class_,
            name: class_.subject?.name || 'Class',
          }))} />
          <div className="bg-white rounded shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Recent Activity</h2>
            </div>
            <div className="p-6">
              <ActivityTimeline activities={activities} />
            </div>
          </div>
        </div>

        {/* Upcoming Classes and Recent Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Classes */}
          <div className="bg-white rounded shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Upcoming Classes</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.upcomingClasses.map((class_) => (
                <div key={class_.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Subject: {class_.subject?.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Teacher: {class_.teacher.user.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Students: {class_.students.map(cs => cs.student.user.name).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(class_.startTime).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(class_.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.upcomingClasses.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No upcoming classes
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                href="/classes"
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                View all classes →
              </Link>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Recent Leads</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{lead.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'NEW'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'CONTACTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'QUALIFIED'
                            ? 'bg-purple-100 text-purple-800'
                            : lead.status === 'CONVERTED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.recentLeads.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No recent leads
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Link
                href="/leads"
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                View all leads →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 