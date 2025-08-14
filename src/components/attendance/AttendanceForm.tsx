'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, User, Save } from 'lucide-react'

interface Student {
  id: string
  user: {
    name: string
    email: string
  }
}

interface StudentAttendance {
  id: string
  studentId: string
  status: string
  notes?: string
  student: {
    user: {
      name: string
    }
  }
}

interface ClassAttendance {
  id: string
  teacherStatus: string
  teacherNotes?: string
  studentAttendance: StudentAttendance[]
}

interface AttendanceFormProps {
  classId: string
  classData: {
    students: { student: Student }[]
    teacher: {
      user: {
        name: string
        email: string
      }
    }
  }
  selectedDate: Date
  existingAttendance?: ClassAttendance
}

export function AttendanceForm({ classId, classData, selectedDate, existingAttendance }: AttendanceFormProps) {
  const [teacherStatus, setTeacherStatus] = useState(existingAttendance?.teacherStatus || 'NOT_SCHEDULED')
  const [teacherNotes, setTeacherNotes] = useState(existingAttendance?.teacherNotes || '')
  const [studentAttendance, setStudentAttendance] = useState<Record<string, { status: string; notes: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Initialize student attendance from existing data or defaults
  useEffect(() => {
    const initialAttendance: Record<string, { status: string; notes: string }> = {}
    
    classData.students.forEach(({ student }) => {
      const existing = existingAttendance?.studentAttendance.find(sa => sa.studentId === student.id)
      initialAttendance[student.id] = {
        status: existing?.status || 'ABSENT',
        notes: existing?.notes || ''
      }
    })
    
    setStudentAttendance(initialAttendance)
  }, [classData.students, existingAttendance])

  const handleStudentStatusChange = (studentId: string, status: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }))
  }

  const handleStudentNotesChange = (studentId: string, notes: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/attendance', {
        method: existingAttendance ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: selectedDate.toISOString().split('T')[0],
          teacherStatus,
          teacherNotes,
          studentAttendance: Object.entries(studentAttendance).map(([studentId, data]) => ({
            studentId,
            status: data.status,
            notes: data.notes
          }))
        }),
      })

      if (response.ok) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      } else {
        throw new Error('Failed to save attendance')
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Failed to save attendance. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Check className="w-4 h-4" />
      case 'ABSENT':
        return <X className="w-4 h-4" />
      case 'LATE':
        return <Clock className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Teacher Attendance */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Teacher Attendance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={teacherStatus}
              onChange={(e) => setTeacherStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="NOT_SCHEDULED">Not Scheduled</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <input
              type="text"
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Students Attendance */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Student Attendance ({classData.students.length} students)
        </h4>
        <div className="space-y-3">
          {classData.students.map(({ student }) => (
            <div key={student.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{student.user.name}</div>
                <div className="text-sm text-gray-600">{student.user.email}</div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={studentAttendance[student.id]?.status || 'ABSENT'}
                  onChange={(e) => handleStudentStatusChange(student.id, e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <input
                  type="text"
                  value={studentAttendance[student.id]?.notes || ''}
                  onChange={(e) => handleStudentNotesChange(student.id, e.target.value)}
                  placeholder="Notes..."
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(studentAttendance[student.id]?.status || 'ABSENT')}`}>
                  {getStatusIcon(studentAttendance[student.id]?.status || 'ABSENT')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isSaved 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {existingAttendance ? 'Update' : 'Save'} Attendance
            </>
          )}
        </button>
      </div>
    </form>
  )
} 