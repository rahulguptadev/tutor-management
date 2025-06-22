import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

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
      phone,
      source,
      status,
      notes,
    } = body

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        lead: true,
      },
    })

    if (existingUser && existingUser.lead) {
      return new NextResponse('A lead with this email already exists', {
        status: 400,
      })
    }

    // Create user and lead in a transaction
    const lead = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: '', // Will be set by the user when they sign up
          role: 'STUDENT',
        },
      })

      return tx.lead.create({
        data: {
          userId: user.id,
          status,
          source,
          notes: notes ? `${notes} | Phone: ${phone || ''}` : `Phone: ${phone || ''}`,
        },
        include: {
          user: true,
        },
      })
    })

    // Log the activity
    await logActivity(
      'LEAD_CREATED',
      `New lead "${name}" created from ${source || 'unknown source'}`,
      session.user.id
    )

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to create lead:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where = {
      ...(status && { status: status as LeadStatus }),
    }

    const leads = await prisma.lead.findMany({
      where,
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
    }) as unknown[]

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
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
      return new NextResponse('Lead ID is required', { status: 400 })
    }

    const body = await req.json()
    const {
      name,
      email,
      phone,
      source,
      status,
      notes,
    } = body

    // If email is being updated, check for duplicates
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          lead: {
            id: { not: id },
          },
        },
      })

      if (existingUser) {
        return new NextResponse('A lead with this email already exists', {
          status: 400,
        })
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        source,
        status,
        notes: notes ? `${notes} | Phone: ${phone || ''}` : `Phone: ${phone || ''}`,
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

    // Update user name and email if provided
    if (name || email) {
      await prisma.user.update({
        where: { id: lead.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      })
    }

    // Log the activity
    await logActivity(
      'LEAD_UPDATED',
      `Lead "${lead.user.name}" status updated to ${lead.status}`,
      session.user.id
    )

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to update lead:', error)
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
      return new NextResponse('Lead ID is required', { status: 400 })
    }

    await prisma.lead.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 