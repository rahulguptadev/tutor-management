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
    const { teacherId, amount, notes } = body

    // Create payout in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          teacherId,
          amount,
          status: 'PENDING',
          notes,
        },
        include: {
          teacher: {
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
        'PAYOUT_CREATED',
        `New payout of ₹${amount} created for ${payout.teacher.user.name}`,
        session.user.id
      )

      return payout
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating payout:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const payouts = await prisma.payout.findMany({
      include: {
        teacher: {
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
        createdAt: 'desc',
      },
    })

    return NextResponse.json(payouts)
  } catch (error) {
    console.error('Error fetching payouts:', error)
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
      return new NextResponse('Payout ID is required', { status: 400 })
    }

    const body = await req.json()
    const { status, notes } = body

    const payout = await prisma.payout.update({
      where: { id },
      data: {
        status,
        notes,
        paidAt: status === 'PAID' ? new Date() : null,
      },
      include: {
        teacher: {
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
        'PAYOUT_PAID',
        `Payout of ₹${payout.amount} paid to ${payout.teacher.user.name}`,
        session.user.id
      )
    } else {
      await logActivity(
        'PAYOUT_CREATED',
        `Payout of ₹${payout.amount} updated for ${payout.teacher.user.name}`,
        session.user.id
      )
    }

    return NextResponse.json(payout)
  } catch (error) {
    console.error('Error updating payout:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 