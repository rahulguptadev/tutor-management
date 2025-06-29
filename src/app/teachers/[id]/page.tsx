import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

type Teacher = {
  id: string
  subjects: string[]
  hourlyRate: number
  bio: string | null
  phoneNumber: string | null
  user: {
    name: string
    email: string
  }
  availabilities: {
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
  }[]
  classes: {
    id: string
    subject: string
    status: string
    startTime: string
    endTime: string
    student: {
      user: {
        name: string
      }
    }
  }[]
  payouts: {
    id: string
    amount: number
    status: string
    paidAt: string
    createdAt: string
  }[]
}

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      availabilities: true,
      subjects: {
        include: {
          subject: true
        }
      },
      classes: {
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
      payouts: true,
    },
  })

  if (!teacher) {
    notFound()
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const availabilityByDay = teacher.availabilities.reduce((acc: Record<number, Teacher['availabilities']>, a: Teacher['availabilities'][0]) => {
    if (!acc[a.dayOfWeek]) {
      acc[a.dayOfWeek] = []
    }
    acc[a.dayOfWeek].push(a)
    return acc
  }, {} as Record<number, Teacher['availabilities']>)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Teacher Details</h1>
          <div className="space-x-4">
            {(session.user.role === 'TEACHER' && session.user.id === teacher.userId) || session.user.role === 'ADMIN' ? (
              <Link
                href={`/teachers/${teacher.id}/availability`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Manage Availability
              </Link>
            ) : null}
            {session.user.role === 'ADMIN' && (
              <Link
                href={`/teachers/${teacher.id}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{teacher.user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{teacher.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{teacher.phoneNumber || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subjects</dt>
                    <dd className="mt-1 text-sm text-gray-900">{teacher.subjects.map(ts => ts.subject.name).join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
                    <dd className="mt-1 text-sm text-gray-900">${teacher.hourlyRate}/hr</dd>
                  </div>
                  {teacher.bio && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="mt-1 text-sm text-gray-900">{teacher.bio}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Availability</h2>
                <dl className="mt-4 space-y-4">
                  {daysOfWeek.map((day, index) => {
                    const dayAvailability = availabilityByDay[index] || []
                    const isAvailable = dayAvailability.some((a: Teacher['availabilities'][0]) => a.isAvailable)
                    const timeSlots = dayAvailability
                      .filter((a: Teacher['availabilities'][0]) => a.isAvailable)
                      .map((a: Teacher['availabilities'][0]) => `${a.startTime} - ${a.endTime}`)
                      .join(', ')

                    return (
                      <div key={day}>
                        <dt className="text-sm font-medium text-gray-500">{day}</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {isAvailable ? timeSlots : 'Not available'}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Classes</h2>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacher.classes.map((cls: any) => (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{cls.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cls.student?.user?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cls.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(cls.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(cls.endTime).toLocaleString()}</td>
                  </tr>
                ))}
                {teacher.classes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No classes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Payouts</h2>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacher.payouts.map((payout: any) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 whitespace-nowrap">₹{payout.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payout.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(payout.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {teacher.payouts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No payouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 