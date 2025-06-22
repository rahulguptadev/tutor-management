import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const {
      subjectId,
      teacherId,
      studentId,
      startTime,
      endTime,
      status,
      notes,
      isRecurring,
      recurrence,
      recurrenceEnd,
    } = body

    // Create class with teacher and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const classItem = await tx.class.create({
        data: {
          subjectId,
          teacherId,
          studentId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status,
          notes,
          isRecurring,
          recurrence,
          recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : undefined,
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
          student: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          subject: {
            select: {
              name: true,
            },
          },
        },
      })

      // Log the activity
      await logActivity(
        'CLASS_CREATED',
        `New class (${classItem.subject.name}) created for ${classItem.student.user.name} with teacher ${classItem.teacher.user.name}`,
        session.user.id
      )

      return classItem
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating class:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const classes = await prisma.class.findMany({
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
      orderBy: {
        startTime: 'desc',
      },
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return new NextResponse('Class ID is required', { status: 400 })
    }

    const existingClass = await prisma.class.findUnique({
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
    })

    if (!existingClass) {
      return new NextResponse('Class not found', { status: 404 })
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...data,
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
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
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
    })

    // Log the activity
    await logActivity(
      'CLASS_UPDATED',
      `Class (${updatedClass.subject.name}) updated for ${updatedClass.student.user.name} with teacher ${updatedClass.teacher.user.name}`,
      session.user.id
    )

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Failed to update class:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 