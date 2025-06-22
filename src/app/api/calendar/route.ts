import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

// GET /api/calendar - Get calendar events with optional filtering
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const teacherId = searchParams.get('teacherId')
    const classId = searchParams.get('classId')

    const where: any = {}

    if (startDate && endDate) {
      where.OR = [
        {
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          endTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          AND: [
            { startTime: { lte: new Date(startDate) } },
            { endTime: { gte: new Date(endDate) } },
          ],
        },
      ]
    }

    if (type) {
      where.type = type
    }

    if (teacherId) {
      where.teacherId = teacherId
    }

    if (classId) {
      where.classId = classId
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/calendar - Create a new calendar event
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      startTime,
      endTime,
      isRecurring,
      recurrence,
      recurrenceEnd,
      teacherId,
      classId,
    } = body

    // Validate required fields
    if (!type || !title || !startTime || !endTime) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check for scheduling conflicts
    const conflicts = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
        ...(teacherId ? { teacherId } : {}),
        ...(classId ? { classId } : {}),
      },
    })

    if (conflicts.length > 0) {
      return new NextResponse('Scheduling conflict detected', { status: 409 })
    }

    const event = await prisma.calendarEvent.create({
      data: {
        type,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isRecurring,
        recurrence,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        teacherId,
        classId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Log activity
    await logActivity(
      'CALENDAR_EVENT_CREATED',
      `Created ${type.toLowerCase()} event: ${title}`,
      session.user.id
    )

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH /api/calendar - Update a calendar event
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      type,
      title,
      description,
      startTime,
      endTime,
      isRecurring,
      recurrence,
      recurrenceEnd,
      teacherId,
      classId,
    } = body

    if (!id) {
      return new NextResponse('Event ID is required', { status: 400 })
    }

    // Check for scheduling conflicts (excluding the current event)
    const conflicts = await prisma.calendarEvent.findMany({
      where: {
        id: { not: id },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
        ...(teacherId ? { teacherId } : {}),
        ...(classId ? { classId } : {}),
      },
    })

    if (conflicts.length > 0) {
      return new NextResponse('Scheduling conflict detected', { status: 409 })
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        type,
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        isRecurring,
        recurrence,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        teacherId,
        classId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Log activity
    await logActivity(
      'CALENDAR_EVENT_UPDATED',
      `Updated ${type.toLowerCase()} event: ${title}`,
      session.user.id
    )

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/calendar - Delete a calendar event
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Event ID is required', { status: 400 })
    }

    const event = await prisma.calendarEvent.delete({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        class: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Log activity
    await logActivity(
      'CALENDAR_EVENT_DELETED',
      `Deleted ${event.type.toLowerCase()} event: ${event.title}`,
      session.user.id
    )

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 