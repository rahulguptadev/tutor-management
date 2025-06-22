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
    const { teacherId, subject, dayOfWeek, time, studentName, studentEmail, studentPhone } = await request.json()

    if (!teacherId || !subject || !dayOfWeek || !time || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify teacher exists and is available at the requested time
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        availabilities: {
          where: {
            dayOfWeek: parseInt(dayOfWeek),
            startTime: { lte: time },
            endTime: { gt: time },
          },
        },
        classes: {
          where: {
            OR: [
              {
                // Check for one-time classes at this time
                startTime: {
                  equals: new Date(
                    new Date().setDate(
                      new Date().getDate() +
                        ((parseInt(dayOfWeek) - new Date().getDay() + 7) % 7)
                    )
                  ),
                },
              },
            ],
          },
        },
        user: {
          select: {
            name: true,
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

    if (teacher.availabilities.length === 0) {
      return NextResponse.json(
        { error: 'Teacher is not available at the requested time' },
        { status: 400 }
      )
    }

    if (teacher.classes.length > 0) {
      return NextResponse.json(
        { error: 'Teacher has a class scheduled at this time' },
        { status: 400 }
      )
    }

    // Create a user for the lead
    const leadUser = await prisma.user.create({
      data: {
        name: studentName,
        email: studentEmail,
        password: 'demo123', // You may want to generate a random password or handle this differently
        role: 'STUDENT',
      },
    })

    // Create a lead for the demo request
    const lead = await prisma.lead.create({
      data: {
        userId: leadUser.id,
        status: 'NEW',
        source: 'Demo Request',
        notes: `Phone: ${studentPhone || ''} | TeacherId: ${teacherId}`,
      },
    })

    // Log the activity (use LEAD_CREATED as ActivityType)
    await prisma.activity.create({
      data: {
        type: 'LEAD_CREATED',
        description: `Demo class requested for ${subject} with teacher ${teacher.user.name} (leadId: ${lead.id}, teacherId: ${teacher.id}, dayOfWeek: ${dayOfWeek}, time: ${time})`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Demo class requested successfully',
      leadId: lead.id,
    })
  } catch (error) {
    console.error('Error scheduling demo:', error)
    return NextResponse.json(
      { error: 'Failed to schedule demo class' },
      { status: 500 }
    )
  }
} 