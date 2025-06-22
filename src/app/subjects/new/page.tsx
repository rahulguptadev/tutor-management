import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SubjectForm } from '@/components/subjects/SubjectForm'

export default async function NewSubjectPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Add New Subject</h1>
        <SubjectForm />
      </div>
    </DashboardLayout>
  )
} 