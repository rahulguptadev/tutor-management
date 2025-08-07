import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'

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

export default async function ClassesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const classes = await prisma.class.findMany({
    where: { isActive: true },
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
      students: {
        include: {
          student: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      },
      subject: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  })

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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <p className="text-sm text-gray-600 mt-1">Manage class schedules and assignments</p>
          </div>
          <Link
            href="/classes/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
          >
            <span className="mr-2">+</span>
            Add Class
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {classes.map((classItem: any, idx: number) => (
                <tr key={classItem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{classItem.name}</td>
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
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">${classItem.fee}</td>
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
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-3 text-center text-gray-500">
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