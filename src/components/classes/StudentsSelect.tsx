"use client"
import Select from 'react-select'

export default function StudentsSelect({ options, value, onChange, errors }: {
  options: { value: string; label: string }[]
  value: { value: string; label: string }[]
  onChange: (selected: any) => void
  errors?: any
}) {
  return (
    <div>
      <Select
        isMulti
        name="studentIds"
        options={options}
        className="mt-2"
        classNamePrefix="select"
        value={value}
        onChange={onChange}
      />
      {errors && (
        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
      )}
    </div>
  )
} 