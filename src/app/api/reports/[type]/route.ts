import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

function parseDateRange(dateRange: string) {
  const now = new Date()
  switch (dateRange) {
    case 'today':
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    case 'tomorrow':
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      return { gte: tomorrow, lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) }
    case '7d':
      return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    case '1m':
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    case '3m':
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
    case 'custom':
      // This will be handled by custom start and end dates
      return undefined
    default:
      return undefined
  }
}

export async function GET(req: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'all'
  const dateRange = searchParams.get('dateRange') || 'all'
  const search = searchParams.get('search') || ''
  const grade = searchParams.get('grade') || ''
  const subject = searchParams.get('subject') || ''
  const teacher = searchParams.get('teacher') || ''
  const student = searchParams.get('student') || ''
  const customStartDate = searchParams.get('customStartDate') || ''
  const customEndDate = searchParams.get('customEndDate') || ''

  let data = []

  if (type === 'students') {
    const where: any = {
      ...(search && {
        user: {
          is: { name: { contains: search, mode: 'insensitive' } },
        },
      }),
      ...(grade && { gradeId: grade }),
      ...(parseDateRange(dateRange) && { createdAt: parseDateRange(dateRange) }),
    }

    // Handle status filter for students (map to isActive field)
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    // If status is 'all', we don't add any filter

    // If subject filter is applied, we need to filter students who are enrolled in that subject
    if (subject) {
      where.enrolledSubjects = {
        some: {
          subjectId: subject
        }
      }
    }

    data = await prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        grade: {
          select: {
            name: true,
            curriculum: true,
          },
        },
        enrolledSubjects: {
          include: {
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (type === 'teachers') {
    const where: any = {
      ...(search && {
        user: {
          is: { name: { contains: search, mode: 'insensitive' } },
        },
      }),
      ...(parseDateRange(dateRange) && { createdAt: parseDateRange(dateRange) }),
    }

    // Handle status filter for teachers (map to isActive field)
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    // If status is 'all', we don't add any filter

    // If subject filter is applied, we need to filter teachers who teach that subject
    if (subject) {
      where.subjects = {
        some: {
          subjectId: subject
        }
      }
    }

    data = await prisma.teacher.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: { 
          include: { 
            subject: { 
              select: { 
                name: true 
              } 
            } 
          } 
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (type === 'classes') {
    // Enhanced classes filtering
    const where: any = {
      isActive: true, // Only show active classes
      ...(status !== 'all' && { status: status.toUpperCase() }),
      ...(search && {
        OR: [
          { subject: { name: { contains: search, mode: 'insensitive' } } },
          { students: { some: { student: { user: { name: { contains: search, mode: 'insensitive' } } } } } },
          { teacher: { user: { name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    }

    // Handle date filtering for classes
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      where.startTime = {
        gte: new Date(customStartDate),
        lte: new Date(customEndDate)
      }
    } else if (dateRange !== 'all') {
      const dateFilter = parseDateRange(dateRange)
      if (dateFilter) {
        where.startTime = dateFilter
      }
    }

    // Subject filter
    if (subject) {
      where.subjectId = subject
    }

    // Teacher filter
    if (teacher) {
      where.teacherId = teacher
    }

    // Student filter
    if (student) {
      where.students = {
        some: {
          studentId: student
        }
      }
    }

    data = await prisma.class.findMany({
      where,
      include: {
        students: { 
          include: { 
            student: { 
              include: { 
                user: { select: { name: true, email: true } },
                grade: { select: { name: true, curriculum: true } }
              } 
            } 
          } 
        },
        teacher: { 
          include: { 
            user: { select: { name: true, email: true } },
            subjects: {
              include: {
                subject: { select: { name: true } }
              }
            }
          } 
        },
        subject: { select: { name: true, description: true } },
      },
      orderBy: { startTime: 'desc' },
    })
  } else if (type === 'attendance') {
    const attendanceType = searchParams.get('attendanceType')
    
    data = await prisma.classAttendance.findMany({
      where: {
        ...(search && {
          class: {
            OR: [
              { students: { some: { student: { user: { name: { contains: search, mode: 'insensitive' } } } } } },
              { teacher: { user: { name: { contains: search, mode: 'insensitive' } } } },
            ],
          },
        }),
        ...(parseDateRange(dateRange) && { date: parseDateRange(dateRange) }),
        ...(status !== 'all' && attendanceType === 'teacher' && { teacherStatus: status as AttendanceStatus }),
        ...(status !== 'all' && attendanceType === 'student' && {
          studentAttendance: {
            some: {
              status: status as AttendanceStatus
            }
          }
        }),
      },
      include: {
        class: {
          include: {
            students: { 
              include: { 
                student: { 
                  include: { 
                    user: { select: { name: true, email: true } },
                    grade: { select: { name: true, curriculum: true } }
                  } 
                } 
              } 
            },
            teacher: { 
              include: { 
                user: { select: { name: true, email: true } } 
              } 
            },
            subject: { select: { name: true } },
          },
        },
        studentAttendance: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
                grade: { select: { name: true, curriculum: true } }
              }
            }
          }
        },
      },
      orderBy: { date: 'desc' },
    })
  } else {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  return NextResponse.json(data)
} 