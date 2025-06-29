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
    const { 
      name, 
      email, 
      password, 
      gradeId, 
      school, 
      mobileNumber, 
      fatherName, 
      fatherContact, 
      motherName, 
      motherContact, 
      enrolledSubjectIds 
    } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'STUDENT',
        },
      })

      const student = await tx.student.create({
        data: {
          userId: user.id,
          gradeId,
          school,
          mobileNumber,
          fatherName,
          fatherContact,
          motherName,
          motherContact,
          enrolledSubjects: {
            connect: enrolledSubjectIds?.map((subjectId: string) => ({ id: subjectId })) || []
          }
        },
      })

      return { user, student }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating student:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 