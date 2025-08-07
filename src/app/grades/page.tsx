import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'

export default async function GradesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const grades = await prisma.grade.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          students: true,
          subjects: true,
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
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: [
      { level: 'asc' },
      { name: 'asc' },
    ],
  })

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
            <p className="text-sm text-gray-600 mt-1">Manage grade levels and curriculum</p>
          </div>
                      <Link
              href="/grades/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
            >
              <span className="mr-2">+</span>
              Add Grade
            </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curriculum
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grade.name}
                    </div>
                    {grade.description && (
                      <div className="text-sm text-gray-500">
                        {grade.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {grade.level}
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {grade.curriculum}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-sm text-gray-900">
                      {grade.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {grade.subjects.map((gs) => (
                            <span
                              key={gs.subject.name}
                              className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                            >
                              {gs.subject.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No subjects</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {grade._count.students} students
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      grade.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {grade.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/grades/${grade.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        entityType="grade"
                        entityId={grade.id}
                        entityName={`${grade.name} (${grade.curriculum})`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No grades found.
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