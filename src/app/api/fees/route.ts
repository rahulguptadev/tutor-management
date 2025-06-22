import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { studentId, amount, dueDate, status, notes } = body

    // Create fee in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Fetch the student to get the name
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { user: { select: { name: true } } },
      });
      if (!student) throw new Error('Student not found');

      const fee = await tx.fee.create({
        data: {
          studentId,
          amount,
          dueDate: new Date(dueDate),
          status,
          notes,
          paidAt: status === 'PAID' ? new Date() : null,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      // Log the activity
      await logActivity(
        'FEE_CREATED',
        `New fee of ₹${amount} created for ${student.user.name}`,
        session.user.id
      )

      return fee
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating fee:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const fees = await prisma.fee.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return NextResponse.json(fees)
  } catch (error) {
    console.error('Error fetching fees:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Fee ID is required', { status: 400 })
    }

    const body = await req.json()
    const { status, amount, dueDate, notes } = body

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        ...(amount && { amount }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
        ...(notes && { notes }),
        ...(status === 'PAID' && {
          paidAmount: amount,
          paidAt: new Date(),
        }),
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Log the activity
    if (status === 'PAID') {
      await logActivity(
        'FEE_PAID',
        `Fee of ₹${amount} paid for ${fee.student.user.name}`,
        session.user.id
      )
    } else {
      await logActivity(
        'FEE_CREATED',
        `Fee of ₹${amount} updated for ${fee.student.user.name}`,
        session.user.id
      )
    }

    return NextResponse.json(fee)
  } catch (error) {
    console.error('Error updating fee:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 