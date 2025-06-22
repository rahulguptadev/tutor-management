import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type TeacherAvailability = {
  startTime: string
  endTime: string
}

type TeacherWithDetails = {
  id: string
  user: {
    name: string
    email: string
  }
  subjects: {
    subject: {
      name: string
    }
  }[]
  hourlyRate: number
  availabilities: TeacherAvailability[]
}

// GET /api/teachers/available - Search for available teachers by subject and time slot
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const dayOfWeek = searchParams.get('dayOfWeek') // 0-6 (Sunday-Saturday)
    const time = searchParams.get('time') // HH:mm format

    if (!subject || !dayOfWeek || !time) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }

    // Find teachers who:
    // 1. Teach the requested subject
    // 2. Are available at the requested time slot
    // 3. Don't have any classes scheduled at that time
    const availableTeachers = await prisma.teacher.findMany({
      where: {
        subjects: {
          some: {
            subject: {
              name: subject
            }
          }
        },
        availabilities: {
          some: {
            dayOfWeek: parseInt(dayOfWeek),
            startTime: { lte: time },
            endTime: { gt: time },
            isAvailable: true
          }
        },
        // Check that there are no classes scheduled at this time
        NOT: {
          classes: {
            some: {
              OR: [
                // Class is on the same day of week and overlaps with the requested time
                {
                  AND: [
                    { startTime: { lte: new Date(`2000-01-${parseInt(dayOfWeek) + 1}T${time}:00`) } },
                    { endTime: { gt: new Date(`2000-01-${parseInt(dayOfWeek) + 1}T${time}:00`) } }
                  ]
                },
                // Class is recurring weekly on this day
                {
                  AND: [
                    { isRecurring: true },
                    { recurrence: 'WEEKLY' },
                    { startTime: { lte: new Date(`2000-01-${parseInt(dayOfWeek) + 1}T${time}:00`) } },
                    { endTime: { gt: new Date(`2000-01-${parseInt(dayOfWeek) + 1}T${time}:00`) } }
                  ]
                }
              ]
            }
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        subjects: {
          include: {
            subject: {
              select: {
                name: true
              }
            }
          }
        },
        availabilities: {
          where: {
            dayOfWeek: parseInt(dayOfWeek),
            isAvailable: true
          }
        }
      }
    })

    // Format the response to include availability details
    const formattedTeachers = availableTeachers.map((teacher: TeacherWithDetails) => ({
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      subjects: teacher.subjects.map(s => s.subject.name),
      hourlyRate: teacher.hourlyRate,
      availability: teacher.availabilities.map((a: TeacherAvailability) => ({
        startTime: a.startTime,
        endTime: a.endTime
      }))
    }))

    return NextResponse.json(formattedTeachers)
  } catch (error) {
    console.error('Error searching for available teachers:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 