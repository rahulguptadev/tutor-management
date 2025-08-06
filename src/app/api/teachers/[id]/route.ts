import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { ActivityType } from '@prisma/client'
import type { Activity } from '@prisma/client'

// GET /api/teachers/[id] - Get teacher details
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

    const teacher = await prisma.teacher.findUnique({
      where: { id: id },
      include: {
        user: { select: { name: true, email: true } },
        subjects: { include: { subject: { select: { name: true } } } },
      },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    // Flatten subjects to array of names
    const teacherData = {
      ...teacher,
      subjects: teacher.subjects.map((s: any) => s.subject.name),
    }

    return NextResponse.json(teacherData)
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PUT /api/teachers/[id] - Update teacher details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json();
    const name = body.name as string;
    const email = body.email as string;
    const phoneNumber = body.phoneNumber as string;
    const subjects = body.subjects; // array of subject IDs
    const bio = body.bio;
    const education = body.education;
    const qualification = body.qualification;

    // Get the teacher to find the associated user
    const teacher = await prisma.teacher.findUnique({
      where: { id: id },
      select: { userId: true },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    // Validate that all subject IDs exist
    const subjectRecords = await prisma.subject.findMany({
      where: { id: { in: subjects } },
      select: { id: true },
    })
    const subjectIds = subjectRecords.map(s => s.id)

    // Update both user and teacher details in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user details
      const updatedUser = await tx.user.update({
        where: { id: teacher.userId },
        data: { name, email },
      })

      // Delete existing teacher-subject relationships
      await tx.teacherSubject.deleteMany({
        where: { teacherId: id },
      })

      // Create new teacher-subject relationships
      if (subjectIds.length > 0) {
        await tx.teacherSubject.createMany({
          data: subjectIds.map(subjectId => ({
            teacherId: id,
            subjectId,
          })),
        })
      }

      // Update teacher details
      const updatedTeacher = await tx.teacher.update({
        where: { id: id },
        data: {
          phoneNumber,
          bio,
          education,
          qualification,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      return { user: updatedUser, teacher: updatedTeacher }
    })

    // Log the activity
    await logActivity(
      ActivityType.CLASS_UPDATED,
      `Updated teacher ${id}`,
      session.user.id
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating teacher:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/teachers/[id] - Soft delete teacher
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

    // Get the teacher to find the associated user
    const teacher = await prisma.teacher.findUnique({
      where: { id: id },
      include: { user: { select: { name: true } } },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    // Soft delete teacher and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Soft delete teacher
      await tx.teacher.update({
        where: { id: id },
        data: { isActive: false },
      })

      // Soft delete the user
      await tx.user.update({
        where: { id: teacher.userId },
        data: { isActive: false },
      })
    })

    // Log the activity
    await logActivity(
      ActivityType.CALENDAR_EVENT_DELETED,
      `Soft deleted teacher ${teacher.user.name}`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 