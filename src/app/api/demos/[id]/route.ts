import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { ActivityType } from '@prisma/client'

// GET /api/demos/[id] - Get demo class details
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

    const demo = await prisma.demoClass.findUnique({
      where: { id: id },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true } },
        user: { select: { name: true } },
      },
    })

    if (!demo) {
      return new NextResponse('Demo class not found', { status: 404 })
    }

    return NextResponse.json(demo)
  } catch (error) {
    console.error('Error fetching demo class:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/demos/[id] - Soft delete demo class
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

    // Get the demo class details
    const demo = await prisma.demoClass.findUnique({
      where: { id: id },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true } },
      },
    })

    if (!demo) {
      return new NextResponse('Demo class not found', { status: 404 })
    }

    // Soft delete demo class
    await prisma.demoClass.update({
      where: { id: id },
      data: { isActive: false },
    })

    // Log the activity
    await logActivity(
      ActivityType.DEMO_CLASS_CREATED,
      `Soft deleted demo class: ${demo.subject.name} with ${demo.teacher.user.name} for ${demo.studentName}`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting demo class:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 