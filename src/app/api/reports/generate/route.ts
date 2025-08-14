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
        if (grade) where.gradeId = grade
        if (school) where.school = school
        
        // Handle status filter for students (map to isActive field)
        if (status === 'active') {
          where.isActive = true;
        } else if (status === 'inactive') {
          where.isActive = false;
        }
        // If status is 'all', we don't add any filter
        
        if (subject) {
          where.enrolledSubjects = {
            some: {
              subjectId: subject
            }
          }
        }

        const students = await prisma.student.findMany({
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

        data = students.map(student => ({
          'Student ID': student.id,
          'Name': student.user.name,
          'Email': student.user.email,
          'Grade': student.grade ? `${student.grade.name} (${student.grade.curriculum})` : '',
          'Subjects': student.enrolledSubjects.map(es => es.subject.name).join('; '),
          'School': student.school || '',
          'Mobile Number': student.mobileNumber || '',
          'Father Name': student.fatherName || '',
          'Father Contact': student.fatherContact || '',
          'Mother Name': student.motherName || '',
          'Mother Contact': student.motherContact || '',
          'Status': student.isActive ? 'Enrolled' : 'Not Enrolled',
          'Created At': student.createdAt.toLocaleDateString(),
        }))

        headers = ['Student ID', 'Name', 'Email', 'Grade', 'Subjects', 'School', 'Mobile Number', 'Father Name', 'Father Contact', 'Mother Name', 'Mother Contact', 'Status', 'Created At']
        break
      }

      case 'teachers': {
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

        data = teachers.map(teacher => ({
          'Teacher ID': teacher.id,
          'Name': teacher.user.name,
          'Email': teacher.user.email,
          'Phone Number': teacher.phoneNumber || '',
          'Subjects': teacher.subjects.map(ts => ts.subject.name).join('; '),
          'Education': teacher.education || '',
          'Qualification': teacher.qualification || '',
          'Bio': teacher.bio || '',
          'Status': teacher.isActive ? 'Active' : 'Inactive',
          'Created At': teacher.createdAt.toLocaleDateString(),
        }))

        headers = ['Teacher ID', 'Name', 'Email', 'Phone Number', 'Subjects', 'Education', 'Qualification', 'Bio', 'Status', 'Created At']
        break
      }

      case 'classes': {
        if (subject) where.subjectId = subject
        if (status) where.status = status

        const classes = await prisma.class.findMany({
          where,
          include: {
            teacher: {
              include: {
                user: { select: { name: true } },
              },
            },
            students: {
              include: {
                student: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
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
          'Students': cls.students.map(cs => cs.student.user.name).join(', '),
          'Start Time': cls.startTime.toLocaleString(),
          'End Time': cls.endTime.toLocaleString(),
          'Status': cls.status,
          'Is Recurring': cls.isRecurring ? 'Yes' : 'No',
          'Recurrence': cls.recurrence || '',
          'Created At': cls.createdAt.toLocaleDateString(),
        }))

        headers = ['Class ID', 'Subject', 'Teacher', 'Students', 'Start Time', 'End Time', 'Status', 'Is Recurring', 'Recurrence', 'Created At']
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

      case 'attendance': {
        const attendanceType = searchParams.get('attendanceType')
        
        const attendance = await prisma.classAttendance.findMany({
          where: {
            ...where,
            ...(status !== 'all' && attendanceType === 'teacher' && { teacherStatus: status }),
            ...(status !== 'all' && attendanceType === 'student' && {
              studentAttendance: {
                some: {
                  status: status
                }
              }
            }),
          },
          include: {
            class: {
              include: {
                teacher: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
                subject: {
                  select: { name: true },
                },
              },
            },
            studentAttendance: {
              include: {
                student: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
          orderBy: { date: 'desc' },
        })

        if (attendanceType === 'student') {
          // Export student attendance records
          data = attendance.flatMap(att => 
            att.studentAttendance.map(sa => ({
              'Date': att.date.toLocaleDateString(),
              'Student': sa.student.user.name,
              'Class': att.class.subject.name,
              'Subject': att.class.subject.name,
              'Status': sa.status,
              'Notes': sa.notes || '',
              'Marked At': att.markedAt.toLocaleString(),
            }))
          )
          headers = ['Date', 'Student', 'Class', 'Subject', 'Status', 'Notes', 'Marked At']
        } else if (attendanceType === 'teacher') {
          // Export teacher attendance records
          data = attendance.map(att => ({
            'Date': att.date.toLocaleDateString(),
            'Teacher': att.class.teacher.user.name,
            'Class': att.class.subject.name,
            'Subject': att.class.subject.name,
            'Status': att.teacherStatus,
            'Notes': att.teacherNotes || '',
            'Marked At': att.markedAt.toLocaleString(),
          }))
          headers = ['Date', 'Teacher', 'Class', 'Subject', 'Status', 'Notes', 'Marked At']
        } else {
          // Export all attendance summary
          data = attendance.map(att => {
            const presentStudents = att.studentAttendance.filter(sa => sa.status === 'PRESENT').length;
            const totalStudents = att.studentAttendance.length;
            
            return {
              'Date': att.date.toLocaleDateString(),
              'Class': att.class.subject.name,
              'Teacher': att.class.teacher.user.name,
              'Teacher Status': att.teacherStatus,
              'Students Present': presentStudents,
              'Total Students': totalStudents,
              'Attendance Rate': totalStudents > 0 ? `${Math.round((presentStudents / totalStudents) * 100)}%` : '0%',
              'Notes': att.teacherNotes || '',
              'Marked At': att.markedAt.toLocaleString(),
            }
          })
          headers = ['Date', 'Class', 'Teacher', 'Teacher Status', 'Students Present', 'Total Students', 'Attendance Rate', 'Notes', 'Marked At']
        }
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