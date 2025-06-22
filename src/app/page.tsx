import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium mb-4">Today&apos;s Classes</h2>
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium mb-4">Pending Fees</h2>
            <p className="text-gray-500">No pending fees</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium mb-4">Teacher Payouts</h2>
            <p className="text-gray-500">No pending payouts</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
