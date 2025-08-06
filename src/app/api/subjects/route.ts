import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            teachers: true,
            classes: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(subjects)
  } catch (error: unknown) {
    console.error('Error fetching subjects:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
      },
    })

    await logActivity(
      "SUBJECT_CREATED" as any,
      `New subject "${name}" created`,
      session.user.id
    )

    return NextResponse.json(subject)
  } catch (error: unknown) {
    console.error('Error creating subject:', error)
    if ((error as { code?: string })?.code === 'P2002') {
      return new NextResponse('Subject with this name already exists', { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { id, name, description } = body

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        description,
      },
    })

    await logActivity(
      "SUBJECT_UPDATED" as any,
      `Subject "${name}" updated`,
      session.user.id
    )

    return NextResponse.json(subject)
  } catch (error: unknown) {
    console.error('Error updating subject:', error)
    if ((error as { code?: string })?.code === 'P2002') {
      return new NextResponse('Subject with this name already exists', { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Subject ID is required', { status: 400 })
    }

    // Check if subject is in use
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            teachers: true,
            classes: true,
          },
        },
      },
    })

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 })
    }

    if (subject._count.teachers > 0 || subject._count.classes > 0) {
      return new NextResponse(
        'Cannot delete subject that is assigned to teachers or classes',
        { status: 400 }
      )
    }

    await prisma.subject.update({
      where: { id },
      data: { isActive: false },
    })

    await logActivity(
      "SUBJECT_DELETED" as any,
      `Subject "${subject.name}" deleted`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    console.error('Error deleting subject:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 