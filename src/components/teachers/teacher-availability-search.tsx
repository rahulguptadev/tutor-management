'use client'

import { useState } from 'react'

type Teacher = {
  id: string
  name: string
  email: string
  subjects: string[]
  hourlyRate: number
  availability: {
    startTime: string
    endTime: string
  }[]
}

type TeacherAvailabilitySearchProps = {
  subjects: string[] // List of all available subjects
  onScheduleDemo?: (teacherId: string, time: string, subject: string, dayOfWeek: string) => Promise<{
    teacherId: string
    time: string
    subject: string
    dayOfWeek: string
  }>
}

export function TeacherAvailabilitySearch({
  subjects,
  onScheduleDemo,
}: TeacherAvailabilitySearchProps) {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const daysOfWeek = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ]

  // Generate time slots from 8 AM to 8 PM
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const searchTeachers = async () => {
    if (!selectedSubject || !selectedDay || !selectedTime) {
      setError('Please select a subject, day, and time')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/teachers/available?subject=${encodeURIComponent(
          selectedSubject
        )}&dayOfWeek=${selectedDay}&time=${selectedTime}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch available teachers')
      }

      const data = await response.json()
      setTeachers(data)
    } catch (err) {
      setError('Failed to search for available teachers')
      console.error('Error searching teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleDemo = async (teacherId: string) => {
    if (!onScheduleDemo) return

    try {
      const demoData = await onScheduleDemo(
        teacherId,
        selectedTime,
        selectedSubject,
        selectedDay
      )

      // Dispatch custom event to open the demo request modal
      const event = new CustomEvent('demo-request', {
        detail: demoData,
      })
      window.dispatchEvent(event)
    } catch (err) {
      setError('Failed to initiate demo scheduling')
      console.error('Error scheduling demo:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Find Available Teachers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Selection */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Day Selection */}
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700">
              Day
            </label>
            <select
              id="day"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a day</option>
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={searchTeachers}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Available Teachers'}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {teachers.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Available Teachers</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <li key={teacher.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{teacher.name}</h4>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                    <p className="text-sm text-gray-500">
                      Subjects: {teacher.subjects.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rate: ${teacher.hourlyRate}/hr
                    </p>
                  </div>
                  {onScheduleDemo && (
                    <button
                      onClick={() => handleScheduleDemo(teacher.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Schedule Demo
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && teachers.length === 0 && selectedSubject && selectedDay && selectedTime && (
        <div className="text-center py-4 text-gray-500">
          No teachers available at the selected time
        </div>
      )}
    </div>
  )
} 