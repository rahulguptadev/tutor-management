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
      studentIds, // now an array
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
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status,
          notes,
          isRecurring,
          recurrence,
          recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : undefined,
        },
      })

      // Create ClassStudent records
      if (Array.isArray(studentIds)) {
        await Promise.all(
          studentIds.map((studentId: string) =>
            tx.classStudent.create({
              data: {
                classId: classItem.id,
                studentId,
              },
            })
          )
        )
      }

      return classItem
    })

    // Fetch class with all students outside the transaction
    const classWithStudents = await prisma.class.findUnique({
      where: { id: result.id },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true } },
        students: {
          include: {
            student: { include: { user: { select: { name: true } } } },
          },
        },
      },
    })

    // Log the activity
    await logActivity(
      'CLASS_CREATED',
      `New class (${classWithStudents?.subject.name}) created with teacher ${classWithStudents?.teacher.user.name} for students: ` + (studentIds || []).join(', '),
      session.user.id
    )

    return NextResponse.json(classWithStudents)
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
        students: {
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
        students: {
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
        students: {
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
      `Class (${updatedClass.subject.name}) updated for ${updatedClass.students[0]?.student.user.name} with teacher ${updatedClass.teacher.user.name}`,
      session.user.id
    )

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Failed to update class:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 