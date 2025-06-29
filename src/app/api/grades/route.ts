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

    const grades = await prisma.grade.findMany({
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(grades)
  } catch (error: unknown) {
    console.error('Error fetching grades:', error)
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
    const { name, level, curriculum, description, isActive, subjectIds } = body

    // Create grade with subjects in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const grade = await tx.grade.create({
        data: {
          name,
          level,
          curriculum,
          description,
          isActive: isActive ?? true,
        },
      })

      // Create GradeSubject records for each subject
      if (Array.isArray(subjectIds) && subjectIds.length > 0) {
        await Promise.all(
          subjectIds.map((subjectId: string, index: number) =>
            tx.gradeSubject.create({
              data: {
                gradeId: grade.id,
                subjectId,
                isCore: true,
                order: index + 1,
              },
            })
          )
        )
      }

      return grade
    })

    await logActivity(
      "GRADE_CREATED" as any,
      `New grade "${name} (${curriculum})" created`,
      session.user.id
    )

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Error creating grade:', error)
    if ((error as { code?: string })?.code === 'P2002') {
      return new NextResponse('Grade with this name and curriculum already exists', { status: 400 })
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
    const { id, name, level, curriculum, description, isActive, subjectIds } = body

    // Update grade with subjects in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const grade = await tx.grade.update({
        where: { id },
        data: {
          name,
          level,
          curriculum,
          description,
          isActive: isActive ?? true,
        },
      })

      // Update subjects if provided
      if (Array.isArray(subjectIds)) {
        // Remove existing subjects
        await tx.gradeSubject.deleteMany({
          where: { gradeId: id },
        })

        // Add new subjects
        if (subjectIds.length > 0) {
          await Promise.all(
            subjectIds.map((subjectId: string, index: number) =>
              tx.gradeSubject.create({
                data: {
                  gradeId: id,
                  subjectId,
                  isCore: true,
                  order: index + 1,
                },
              })
            )
          )
        }
      }

      return grade
    })

    await logActivity(
      "GRADE_UPDATED" as any,
      `Grade "${name} (${curriculum})" updated`,
      session.user.id
    )

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Error updating grade:', error)
    if ((error as { code?: string })?.code === 'P2002') {
      return new NextResponse('Grade with this name and curriculum already exists', { status: 400 })
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
      return new NextResponse('Grade ID is required', { status: 400 })
    }

    // Check if grade is in use
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    })

    if (!grade) {
      return new NextResponse('Grade not found', { status: 404 })
    }

    if (grade._count.students > 0) {
      return new NextResponse(
        'Cannot delete grade that has students assigned to it',
        { status: 400 }
      )
    }

    await prisma.grade.delete({
      where: { id },
    })

    await logActivity(
      "GRADE_DELETED" as any,
      `Grade "${grade.name} (${grade.curriculum})" deleted`,
      session.user.id
    )

    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    console.error('Error deleting grade:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 