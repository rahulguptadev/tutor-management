import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { teacherId, subjectId, studentName, studentEmail, studentPhone, scheduledDate, scheduledTime } = await request.json()

    if (!teacherId || !subjectId || !studentName || !studentEmail || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Check if teacher teaches this subject
    const teacherSubject = teacher.subjects.find(ts => ts.subject.id === subjectId)
    if (!teacherSubject) {
      return NextResponse.json(
        { error: 'Teacher does not teach this subject' },
        { status: 400 }
      )
    }

    // Create demo class
    const demoClass = await prisma.demoClass.create({
      data: {
        teacherId,
        subjectId,
        studentName,
        studentEmail,
        studentPhone: studentPhone || null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        createdBy: session.user.id,
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
        subject: true,
      },
    })

    // Log the activity
    await prisma.activity.create({
      data: {
        type: 'DEMO_CLASS_CREATED',
        description: `Demo class scheduled for ${studentName} (${studentEmail}) with ${teacher.user.name} for ${subject.name} on ${scheduledDate} at ${scheduledTime}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Demo class scheduled successfully',
      demoClass,
    })
  } catch (error) {
    console.error('Error scheduling demo class:', error)
    return NextResponse.json(
      { error: 'Failed to schedule demo class' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const timeFilter = searchParams.get('timeFilter') || '7days'
    const status = searchParams.get('status')

    // Calculate date range based on time filter
    const now = new Date()
    let startDate = new Date()
    
    switch (timeFilter) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Build where clause
    const where: any = {
      scheduledDate: {
        gte: startDate,
      },
    }

    if (status) {
      where.status = status
    }

    const demoClasses = await prisma.demoClass.findMany({
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
        subject: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    })

    return NextResponse.json(demoClasses)
  } catch (error) {
    console.error('Error fetching demo classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch demo classes' },
      { status: 500 }
    )
  }
} 