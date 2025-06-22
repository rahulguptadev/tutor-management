"use client";

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import Link from 'next/link'

type Class = {
  id: string
  name: string
  startTime: Date
  teacher: {
    user: {
      name: string
    }
  }
}

type CalendarViewProps = {
  classes: Class[]
}

export function CalendarView({ classes }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getClassesForDay = (date: Date) => {
    return classes.filter((class_) => isSameDay(new Date(class_.startTime), date))
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Class Calendar</h2>
          <div className="flex space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {format(currentDate, 'MMMM yyyy')}
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day) => {
            const dayClasses = getClassesForDay(day)
            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] bg-white p-2 ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
                }`}
              >
                <div
                  className={`text-sm ${
                    isToday(day)
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white'
                      : isSameMonth(day, currentDate)
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {dayClasses.map((class_) => (
                    <Link
                      key={class_.id}
                      href={`/classes/${class_.id}`}
                      className="block truncate rounded bg-blue-50 px-1 py-0.5 text-xs text-blue-700 hover:bg-blue-100"
                    >
                      {format(new Date(class_.startTime), 'HH:mm')} - {class_.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 