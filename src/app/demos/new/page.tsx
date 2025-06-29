import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { CreateDemoClassForm } from '@/components/demos/CreateDemoClassForm'

export default async function NewDemoClassPage() {
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
      <div className="max-w-7xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Schedule New Demo Class</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new demo class for a potential student
          </p>
        </div>

        <CreateDemoClassForm />
      </div>
    </DashboardLayout>
  )
} 