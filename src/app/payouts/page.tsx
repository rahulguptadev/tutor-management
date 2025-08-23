import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

type Payout = {
  id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'PROCESSING'
  paidAt: Date | null
  createdAt: Date
  teacher: {
    user: {
      name: string
    }
    hourlyRate: number
  }
}

export default async function PayoutsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const payouts = await prisma.payout.findMany({
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
      createdAt: 'desc',
    },
  }) as Payout[]

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1"></div>
          <Link
            href="/payouts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
          >
            Add Payout
          </Link>
        </div>
        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow">
            <table className="w-full divide-y divide-blue-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Paid At</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {payouts.map((payout: any, idx: number) => (
                  <tr key={payout.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{payout.teacher?.user?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">${payout.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Link
                        href={`/payouts/${payout.id}`}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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