import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DemoClassesList } from '@/components/demos/DemoClassesList'

export default async function DemosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Demo Classes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track demo class schedules
          </p>
        </div>

        <DemoClassesList />
      </div>
    </DashboardLayout>
  )
} 