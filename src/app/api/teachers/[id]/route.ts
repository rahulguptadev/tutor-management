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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    return NextResponse.json(teacher)
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
    const subjects = body.subjects;
    const hourlyRate = body.hourlyRate;
    const bio = body.bio;

    // Get the teacher to find the associated user
    const teacher = await prisma.teacher.findUnique({
      where: { id: id },
      select: { userId: true },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    // Update both user and teacher details in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user details
      const updatedUser = await tx.user.update({
        where: { id: teacher.userId },
        data: {
          name,
          email,
        },
      })

      // Update teacher details
      const updatedTeacher = await tx.teacher.update({
        where: { id: id },
        data: {
          phoneNumber,
          subjects,
          hourlyRate,
          bio,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
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

// DELETE /api/teachers/[id] - Delete teacher
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
      select: { userId: true },
    })

    if (!teacher) {
      return new NextResponse('Teacher not found', { status: 404 })
    }

    // Delete teacher and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete teacher first (due to foreign key constraints)
      await tx.teacher.delete({
        where: { id: id },
      })

      // Then delete the user
      await tx.user.delete({
        where: { id: teacher.userId },
      })
    })

    // Log the activity
    await logActivity(
      ActivityType.CALENDAR_EVENT_DELETED,
      `Deleted teacher ${id}`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 