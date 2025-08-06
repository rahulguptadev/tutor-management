import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { ActivityType } from '@prisma/client'

// GET /api/grades/[id] - Get grade details
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

    const grade = await prisma.grade.findUnique({
      where: { id: id },
      include: {
        subjects: { include: { subject: { select: { name: true } } } },
        students: { include: { user: { select: { name: true } } } },
      },
    })

    if (!grade) {
      return new NextResponse('Grade not found', { status: 404 })
    }

    return NextResponse.json(grade)
  } catch (error) {
    console.error('Error fetching grade:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/grades/[id] - Soft delete grade
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

    // Get the grade details
    const grade = await prisma.grade.findUnique({
      where: { id: id },
    })

    if (!grade) {
      return new NextResponse('Grade not found', { status: 404 })
    }

    // Check if grade has active students
    const activeStudents = await prisma.student.count({
      where: { 
        gradeId: id,
        isActive: true 
      },
    })

    if (activeStudents > 0) {
      return new NextResponse(
        'Cannot delete grade that has active students. Please reassign or deactivate students first.',
        { status: 400 }
      )
    }

    // Soft delete grade
    await prisma.grade.update({
      where: { id: id },
      data: { isActive: false },
    })

    // Log the activity
    await logActivity(
      ActivityType.SUBJECT_DELETED,
      `Soft deleted grade: ${grade.name} (${grade.curriculum})`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting grade:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 