import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { TeacherAvailabilitySearch } from '@/components/teachers/teacher-availability-search'
import { DemoRequestModal } from '@/components/teachers/demo-request-modal'

type TeacherWithSubjects = {
  subjects: {
    subject: {
      name: string
    }
  }[]
}

export default async function TeacherSearchPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Get all unique subjects from teachers
  const teachers = await prisma.teacher.findMany({
    select: {
      subjects: {
        select: {
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  }) as TeacherWithSubjects[]

  const subjects = Array.from(
    new Set(teachers.flatMap((teacher: TeacherWithSubjects) => teacher.subjects.map(s => s.subject.name)))
  ).sort()

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Find Available Teachers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search for teachers available at a specific time for a subject
          </p>
        </div>

        <TeacherAvailabilitySearch
          subjects={subjects}
          onScheduleDemo={async (teacherId, time, subject, dayOfWeek) => {
            'use server'
            // The actual demo scheduling will be handled by the client-side modal
            return { teacherId, time, subject, dayOfWeek }
          }}
        />

        <DemoRequestModal />
      </div>
    </DashboardLayout>
  )
} 