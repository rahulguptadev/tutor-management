import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, email, password, phoneNumber, subjects, bio, availability, education, qualification } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    // Create user and teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'TEACHER',
        },
      })

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          phoneNumber,
          bio,
          availability,
          education,
          qualification,
        },
      })

      // Create TeacherSubject records for each subject
      if (Array.isArray(subjects) && subjects.length > 0) {
        await Promise.all(
          subjects.map((subjectId: string) =>
            tx.teacherSubject.create({
              data: {
                teacherId: teacher.id,
                subjectId,
              },
            })
          )
        )
      }

      return { user, teacher }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating teacher:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// After migration, run npx prisma generate to update the Prisma client types