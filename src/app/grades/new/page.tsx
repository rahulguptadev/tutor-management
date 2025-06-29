import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GradeForm } from '@/components/grades/GradeForm'

export default async function NewGradePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Add New Grade</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <GradeForm />
        </div>
      </div>
    </DashboardLayout>
  )
} 