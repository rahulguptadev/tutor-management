import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

type AvailabilityDay = {
  day: string;
  isAvailable: boolean;
  slots?: { startTime: string; endTime: string }[];
};

const dayOfWeekMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// GET /api/teachers/[id]/availability - Get teacher availability
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        availabilities: true,
      },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    return NextResponse.json(teacher.availabilities)
  } catch (error) {
    console.error('Error fetching teacher availability:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/teachers/[id]/availability - Update teacher availability
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Allow admins to update any teacher's availability
    if (session.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        select: { userId: true },
      })
      if (!teacher || teacher.userId !== session.user.id) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    } else if (session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data: Record<string, unknown> = await request.json()
    const availability = data.availability as AvailabilityDay[]

    // Delete existing availability records
    await prisma.teacherAvailability.deleteMany({
      where: { teacherId: id },
    })

    // Create new availability records
    // Transform the data structure: each day can have multiple time slots
    const availabilityRecords = []
    
    for (const day of availability) {
      const dayOfWeek = dayOfWeekMap[day.day];
      if (day.isAvailable && day.slots && day.slots.length > 0) {
        // Create a record for each time slot
        for (const slot of day.slots) {
          availabilityRecords.push({
            teacherId: id,
            dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          })
        }
      } else {
        // Create a record for unavailable days
        availabilityRecords.push({
          teacherId: id,
          dayOfWeek,
          startTime: '00:00',
          endTime: '00:00',
          isAvailable: false,
        })
      }
    }

    const availabilities = await Promise.all(
      availabilityRecords.map((record) =>
        prisma.teacherAvailability.create({
          data: record,
        })
      )
    )

    // Log activity
    await logActivity(
      'CALENDAR_EVENT_UPDATED',
      `Updated availability for teacher ${id}`,
      session.user.id
    )

    return NextResponse.json(availabilities)
  } catch (error) {
    console.error('Error updating teacher availability:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 