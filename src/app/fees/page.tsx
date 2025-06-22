import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

type Fee = {
  id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  dueDate: Date
  paidAt: Date | null
  student: {
    user: {
      name: string
    }
  }
}

export default async function FeesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const fees = await prisma.fee.findMany({
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
    orderBy: {
      dueDate: 'desc',
    },
  }) as Fee[]

  const getStatusColor = (status: Fee['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fees</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1"></div>
          <Link
            href="/fees/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
          >
            Add Fee
          </Link>
        </div>
        {/* Add filter/search bar here if needed */}
        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {fees.map((fee: any, idx: number) => (
                  <tr key={fee.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{fee.student?.user?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">${fee.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {fee.status === 'PENDING' && (
                        <Link
                          href={`/fees/${fee.id}/pay`}
                          className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                        >
                          Mark as Paid
                        </Link>
                      )}
                      <Link
                        href={`/fees/${fee.id}`}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {fees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No fees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination here */}
      </div>
    </DashboardLayout>
  )
} 