'use client'

import { useState } from 'react'

type TimeSlot = {
  startTime: string
  endTime: string
}

type DayAvailability = {
  day: number
  isAvailable: boolean
  slots: TimeSlot[]
}

type TeacherAvailabilityProps = {
  initialAvailability: DayAvailability[]
  onSave: (availability: DayAvailability[]) => Promise<{ success: boolean; error?: string }>
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export function TeacherAvailability({
  initialAvailability,
  onSave,
}: TeacherAvailabilityProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>(
    initialAvailability.length
      ? initialAvailability
      : DAYS_OF_WEEK.map((_, index) => ({
          day: index,
          isAvailable: false,
          slots: [{ startTime: '09:00', endTime: '17:00' }],
        }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDayAvailability = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day === dayIndex ? { ...day, isAvailable: !day.isAvailable } : day
      )
    )
  }

  const updateTimeSlot = (
    dayIndex: number,
    slotIndex: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day === dayIndex
          ? {
              ...day,
              slots: day.slots.map((slot, idx) =>
                idx === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    )
  }

  const addTimeSlot = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day === dayIndex
          ? {
              ...day,
              slots: [...day.slots, { startTime: '09:00', endTime: '17:00' }],
            }
          : day
      )
    )
  }

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.day === dayIndex
          ? {
              ...day,
              slots: day.slots.filter((_, idx) => idx !== slotIndex),
            }
          : day
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await onSave(availability)
      if (!result.success) {
        setError(result.error || 'Failed to save availability')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {DAYS_OF_WEEK.map((dayName, dayIndex) => {
        const dayAvailability = availability.find((d) => d.day === dayIndex)!
        return (
          <div key={dayName} className="border rounded p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dayAvailability.isAvailable}
                  onChange={() => toggleDayAvailability(dayIndex)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">{dayName}</span>
              </label>
              {dayAvailability.isAvailable && (
                <button
                  onClick={() => addTimeSlot(dayIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Add Time Slot
                </button>
              )}
            </div>

            {dayAvailability.isAvailable && (
              <div className="space-y-4">
                {dayAvailability.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center space-x-4">
                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        updateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)
                      }
                      className="rounded border-gray-300"
                    >
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <span>to</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        updateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)
                      }
                      className="rounded border-gray-300"
                    >
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {dayAvailability.slots.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  )
} 