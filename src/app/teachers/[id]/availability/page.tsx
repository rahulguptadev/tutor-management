import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TeacherAvailability } from '@/components/calendar/teacher-availability'
import { DashboardLayout } from '@/components/dashboard-layout'

type TeacherAvailabilityType = {
  id: string
  teacherId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export default async function TeacherAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    redirect('/auth/signin')
  }

  // Only allow admins or the teacher themselves to access this page
  if (session.user.role !== 'ADMIN' && 
      (session.user.role !== 'TEACHER' || session.user.id !== id)) {
    redirect('/dashboard')
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      availabilities: true,
    },
  })

  if (!teacher) {
    redirect('/teachers')
  }

  // Transform availability data for the component
  const availability = teacher.availabilities.map((a: TeacherAvailabilityType) => ({
    day: a.dayOfWeek,
    isAvailable: a.isAvailable,
    slots: [{ startTime: a.startTime, endTime: a.endTime }],
  }))

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Manage Availability for {teacher.user.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set weekly availability for classes
          </p>
        </div>

        <TeacherAvailability
          initialAvailability={availability}
          onSave={async (newAvailability) => {
            'use server'
            try {
              const response = await fetch(`/api/teachers/${teacher.id}/availability`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ availability: newAvailability }),
              })

              if (!response.ok) {
                throw new Error('Failed to save availability')
              }

              return { success: true }
            } catch (error) {
              return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to save availability'
              }
            }
          }}
        />
      </div>
    </DashboardLayout>
  )
} 