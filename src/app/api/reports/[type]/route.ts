import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseDateRange(dateRange: string) {
  const now = new Date()
  switch (dateRange) {
    case '7d':
      return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    case '1m':
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    case '3m':
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
    default:
      return undefined
  }
}

export async function GET(req: Request, context: { params: { type: string } }) {
  const { type } = context.params;
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'all'
  const dateRange = searchParams.get('dateRange') || 'all'
  const search = searchParams.get('search') || ''

  let data = []

  if (type === 'students') {
    data = await prisma.student.findMany({
      where: {
        ...(search && {
          user: {
            is: { name: { contains: search, mode: 'insensitive' } },
          },
        }),
        ...(parseDateRange(dateRange) && { createdAt: parseDateRange(dateRange) }),
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (type === 'teachers') {
    data = await prisma.teacher.findMany({
      where: {
        ...(search && {
          user: {
            is: { name: { contains: search, mode: 'insensitive' } },
          },
        }),
        ...(parseDateRange(dateRange) && { createdAt: parseDateRange(dateRange) }),
      },
      include: {
        user: true,
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (type === 'classes') {
    data = await prisma.class.findMany({
      where: {
        ...(status !== 'all' && { status: status.toUpperCase() }),
        ...(search && {
          OR: [
            { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
            { teacher: { user: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        }),
        ...(parseDateRange(dateRange) && { createdAt: parseDateRange(dateRange) }),
      },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (type === 'attendance') {
    data = await prisma.class.findMany({
      where: {
        ...(search && {
          OR: [
            { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
            { teacher: { user: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        }),
        ...(parseDateRange(dateRange) && { createdAt: parseDateRange(dateRange) }),
      },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  return NextResponse.json(data)
} 