import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { ActivityType } from '@prisma/client'

// GET /api/students/[id] - Get student details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { id: id },
      include: {
        user: { select: { name: true, email: true } },
        grade: { select: { name: true, curriculum: true, level: true } },
        enrolledSubjects: { include: { subject: { select: { name: true } } } },
        classes: {
          include: {
            class: {
              include: {
                teacher: { include: { user: { select: { name: true } } } },
                subject: true,
              },
            },
          },
        },
        fees: true,
      },
    })

    if (!student) {
      return new NextResponse('Student not found', { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/students/[id] - Soft delete student
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the student to find the associated user
    const student = await prisma.student.findUnique({
      where: { id: id },
      include: { user: { select: { name: true } } },
    })

    if (!student) {
      return new NextResponse('Student not found', { status: 404 })
    }

    // Soft delete student and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Soft delete student
      await tx.student.update({
        where: { id: id },
        data: { isActive: false },
      })

      // Soft delete the user
      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      })
    })

    // Log the activity
    await logActivity(
      ActivityType.CALENDAR_EVENT_DELETED,
      `Soft deleted student ${student.user.name}`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting student:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 