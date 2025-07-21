import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import EditStudentForm from './EditStudentForm'

interface EditStudentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      grade: {
        select: {
          id: true,
          name: true,
          curriculum: true,
        },
      },
      enrolledSubjects: true,
    },
  })

  if (!student) {
    notFound()
  }

  // Get all subjects for the multi-select
  const allSubjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
  })

  // Get all grades for the dropdown
  const allGrades = await prisma.grade.findMany({
    where: { isActive: true },
    orderBy: [
      { level: 'asc' },
      { name: 'asc' },
    ],
  })

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Student</h1>
          <Link
            href={`/students/${id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
        </div>

        <EditStudentForm student={student} allSubjects={allSubjects} allGrades={allGrades} />
      </div>
    </DashboardLayout>
  )
} 