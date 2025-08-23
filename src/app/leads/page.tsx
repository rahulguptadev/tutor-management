import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

type Lead = {
  id: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  source: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    name: string
    email: string
  }
}

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const leads = await prisma.lead.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as Lead[]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1"></div>
          <Link
            href="/leads/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
          >
            Add Lead
          </Link>
        </div>
        {/* Add filter/search bar here if needed */}
        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow">
            <table className="w-full divide-y divide-blue-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {leads.map((lead: any, idx: number) => (
                  <tr key={lead.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{lead.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{lead.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{lead.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{lead.source || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No leads found.
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