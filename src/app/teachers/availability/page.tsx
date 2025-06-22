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

export default async function TeacherAvailabilityPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Allow both teachers and admins to access this page
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // For teachers, get their own availability. For admins, we'll need to handle this differently
  let teacher
  if (session.user.role === 'TEACHER') {
    teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        availabilities: true,
      },
    })
  } else {
    // For admin, we need to get the teacher ID from the URL
    // This will be implemented when we add the ability to manage other teachers' availability
    redirect('/teachers') // For now, redirect to teachers list
  }

  if (!teacher) {
    redirect('/dashboard')
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
          <h1 className="text-2xl font-semibold">Manage Availability</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your weekly availability for classes
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