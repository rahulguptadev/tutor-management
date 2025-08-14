import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { classId, date, teacherStatus, teacherNotes, studentAttendance } = body

    // Validate required fields
    if (!classId || !date || !teacherStatus) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if attendance already exists for this class and date
    const existingAttendance = await prisma.classAttendance.findUnique({
      where: {
        classId_date: {
          classId,
          date: new Date(date)
        }
      }
    })

    if (existingAttendance) {
      return new NextResponse('Attendance already exists for this class and date', { status: 409 })
    }

    // Create class attendance record
    const classAttendance = await prisma.classAttendance.create({
      data: {
        classId,
        date: new Date(date),
        teacherStatus,
        teacherNotes,
        markedBy: session.user.id,
      }
    })

    // Create student attendance records
    if (studentAttendance && studentAttendance.length > 0) {
      await prisma.studentAttendance.createMany({
        data: studentAttendance.map((sa: any) => ({
          classAttendanceId: classAttendance.id,
          studentId: sa.studentId,
          status: sa.status,
          notes: sa.notes
        }))
      })
    }

    // Log activity
    await logActivity(
      'ATTENDANCE_MARKED',
      `Marked attendance for class on ${new Date(date).toLocaleDateString()}`,
      session.user.id
    )

    return NextResponse.json({ success: true, id: classAttendance.id })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { classId, date, teacherStatus, teacherNotes, studentAttendance } = body

    // Validate required fields
    if (!classId || !date || !teacherStatus) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Find existing attendance record
    const existingAttendance = await prisma.classAttendance.findUnique({
      where: {
        classId_date: {
          classId,
          date: new Date(date)
        }
      },
      include: {
        studentAttendance: true
      }
    })

    if (!existingAttendance) {
      return new NextResponse('Attendance record not found', { status: 404 })
    }

    // Update class attendance
    await prisma.classAttendance.update({
      where: { id: existingAttendance.id },
      data: {
        teacherStatus,
        teacherNotes,
        markedBy: session.user.id,
      }
    })

    // Update student attendance records
    if (studentAttendance && studentAttendance.length > 0) {
      // Delete existing student attendance records
      await prisma.studentAttendance.deleteMany({
        where: { classAttendanceId: existingAttendance.id }
      })

      // Create new student attendance records
      await prisma.studentAttendance.createMany({
        data: studentAttendance.map((sa: any) => ({
          classAttendanceId: existingAttendance.id,
          studentId: sa.studentId,
          status: sa.status,
          notes: sa.notes
        }))
      })
    }

    // Log activity
    await logActivity(
      'ATTENDANCE_UPDATED',
      `Updated attendance for class on ${new Date(date).toLocaleDateString()}`,
      session.user.id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 