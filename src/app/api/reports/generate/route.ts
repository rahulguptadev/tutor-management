import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('reportType')
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const grade = searchParams.get('grade')
    const school = searchParams.get('school')
    const subject = searchParams.get('subject')
    const status = searchParams.get('status')

    // Build where clause based on filters
    const where: Record<string, unknown> = {}
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    let data: Record<string, unknown>[] = []
    let headers: string[] = []

    switch (reportType) {
      case 'students': {
        if (grade) where.grade = grade
        if (school) where.school = school

        const students = await prisma.student.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = students.map(student => ({
          'Student ID': student.id,
          'Name': student.user.name,
          'Email': student.user.email,
          'Grade': student.grade || '',
          'School': student.school || '',
          'Mobile Number': student.mobileNumber || '',
          'Created At': student.createdAt.toLocaleDateString(),
        }))

        headers = ['Student ID', 'Name', 'Email', 'Grade', 'School', 'Mobile Number', 'Created At']
        break
      }

      case 'teachers': {
        const teachers = await prisma.teacher.findMany({
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
                subject: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = teachers.map(teacher => ({
          'Teacher ID': teacher.id,
          'Name': teacher.user.name,
          'Email': teacher.user.email,
          'Subjects': teacher.subjects.map(ts => ts.subject.name).join(', '),
          'Hourly Rate': teacher.hourlyRate,
          'Created At': teacher.createdAt.toLocaleDateString(),
        }))

        headers = ['Teacher ID', 'Name', 'Email', 'Subjects', 'Hourly Rate', 'Created At']
        break
      }

      case 'classes': {
        if (subject) where.subject = subject
        if (status) where.status = status

        const classes = await prisma.class.findMany({
          where,
          include: {
            teacher: {
              include: {
                user: { select: { name: true } },
              },
            },
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
            subject: {
              select: { name: true },
            },
          },
          orderBy: { startTime: 'desc' },
        })

        data = classes.map(cls => ({
          'Class ID': cls.id,
          'Subject': cls.subject.name,
          'Teacher': cls.teacher.user.name,
          'Student': cls.student.user.name,
          'Start Time': cls.startTime.toLocaleString(),
          'End Time': cls.endTime.toLocaleString(),
          'Status': cls.status,
          'Is Recurring': cls.isRecurring ? 'Yes' : 'No',
          'Recurrence': cls.recurrence || '',
          'Created At': cls.createdAt.toLocaleDateString(),
        }))

        headers = ['Class ID', 'Subject', 'Teacher', 'Student', 'Start Time', 'End Time', 'Status', 'Is Recurring', 'Recurrence', 'Created At']
        break
      }

      case 'fees': {
        const fees = await prisma.fee.findMany({
          where,
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { dueDate: 'desc' },
        })

        data = fees.map(fee => ({
          'Fee ID': fee.id,
          'Student': fee.student.user.name,
          'Amount': fee.amount,
          'Due Date': fee.dueDate.toLocaleDateString(),
          'Status': fee.status,
          'Paid Amount': fee.paidAmount,
          'Paid At': fee.paidAt ? fee.paidAt.toLocaleDateString() : '',
          'Created At': fee.createdAt.toLocaleDateString(),
        }))

        headers = ['Fee ID', 'Student', 'Amount', 'Due Date', 'Status', 'Paid Amount', 'Paid At', 'Created At']
        break
      }

      default:
        return new NextResponse('Invalid report type', { status: 400 })
    }

    // Generate file based on format
    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${reportType}-report.xlsx"`,
        },
      })
    } else {
      // Generate CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report.csv"`,
        },
      })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 