import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { EditSubjectForm } from '@/components/subjects/EditSubjectForm'

interface EditSubjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const { id } = await params

  const subject = await prisma.subject.findUnique({
    where: { id },
  })

  if (!subject) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Subject</h1>
        <EditSubjectForm subject={subject} />
      </div>
    </DashboardLayout>
  )
} 