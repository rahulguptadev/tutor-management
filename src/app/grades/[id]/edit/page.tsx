import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { GradeForm } from '@/components/grades/GradeForm'

interface EditGradePageProps {
  params: Promise<{ id: string }>
}

export default async function EditGradePage({ params }: EditGradePageProps) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const { id } = await params

  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      subjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  if (!grade) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Grade</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <GradeForm grade={grade} />
        </div>
      </div>
    </DashboardLayout>
  )
} 