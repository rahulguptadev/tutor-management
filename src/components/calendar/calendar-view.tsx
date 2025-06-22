"use client";

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns'

type EventType = 'CLASS' | 'HOLIDAY' | 'BREAK' | 'AVAILABILITY' | 'OTHER'
type RecurrenceType = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'NONE'

type CalendarEvent = {
  id: string
  type: EventType
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  isRecurring: boolean
  recurrence?: RecurrenceType | null
  recurrenceEnd?: Date | null
  teacher?: {
    user: {
      name: string
    }
  } | null
  class?: {
    id: string
    subject: string
    students: {
      user: {
        name: string
      }
    }[]
  } | null
}

type CalendarViewProps = {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}

export function CalendarView({
  events,
  onEventClick,
  onDateClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime)

      // Check if event is on this day
      if (isSameDay(eventStart, date)) {
        return true
      }

      // Check recurring events
      if (event.isRecurring && event.recurrence && event.recurrenceEnd) {
        const recurrenceEnd = new Date(event.recurrenceEnd)
        if (isWithinInterval(date, { start: eventStart, end: recurrenceEnd })) {
          switch (event.recurrence) {
            case 'DAILY':
              return true
            case 'WEEKLY':
              return eventStart.getDay() === date.getDay()
            case 'BIWEEKLY':
              const weeksDiff = Math.floor(
                (date.getTime() - eventStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
              )
              return weeksDiff % 2 === 0 && eventStart.getDay() === date.getDay()
            case 'MONTHLY':
              return eventStart.getDate() === date.getDate()
            default:
              return false
          }
        }
      }

      return false
    })
  }

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'CLASS':
        return 'bg-blue-100 text-blue-800'
      case 'HOLIDAY':
        return 'bg-red-100 text-red-800'
      case 'BREAK':
        return 'bg-yellow-100 text-yellow-800'
      case 'AVAILABILITY':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Calendar</h2>
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
            const dayEvents = getEventsForDay(day)
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] bg-white p-2 ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
                } ${onDateClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onDateClick?.(day)}
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
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                      className={`truncate rounded px-1 py-0.5 text-xs ${
                        getEventColor(event.type)
                      } ${onEventClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                      title={event.description || event.title}
                    >
                      {format(new Date(event.startTime), 'HH:mm')} - {event.title}
                      {event.isRecurring && (
                        <span className="ml-1 text-xs opacity-75">↻</span>
                      )}
                    </div>
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