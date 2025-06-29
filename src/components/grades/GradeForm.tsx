'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const gradeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.number().min(1, 'Level must be at least 1'),
  curriculum: z.string().min(1, 'Curriculum is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  subjectIds: z.array(z.string()).optional(),
})

type GradeFormValues = z.infer<typeof gradeSchema>

interface Subject {
  id: string
  name: string
}

interface GradeFormProps {
  grade?: {
    id: string
    name: string
    level: number
    curriculum: string
    description?: string | null
    isActive: boolean
    subjects: {
      subject: {
        id: string
        name: string
      }
    }[]
  }
}

export function GradeForm({ grade }: GradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: grade?.name || '',
      level: grade?.level || 1,
      curriculum: grade?.curriculum || '',
      description: grade?.description || '',
      isActive: grade?.isActive ?? true,
      subjectIds: grade?.subjects.map(gs => gs.subject.id) || [],
    },
  })

  // Fetch subjects on mount
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(setSubjects)
      .catch(() => setSubjects([]))
  }, [])

  // Set selected subjects when grade is provided
  useEffect(() => {
    if (grade) {
      setSelectedSubjectIds(grade.subjects.map(gs => gs.subject.id))
    }
  }, [grade])

  const onSubmit = async (data: GradeFormValues) => {
    setIsSubmitting(true)
    try {
      const method = grade ? 'PATCH' : 'POST'
      const body = grade ? { ...data, id: grade.id } : data

      const res = await fetch('/api/grades', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          subjectIds: selectedSubjectIds,
        }),
      })
      
      if (res.ok) {
        router.push('/grades')
      } else {
        const err = await res.text()
        alert(err)
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Grade Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            placeholder="e.g., 10th Grade"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700">
            Level *
          </label>
          <input
            type="number"
            id="level"
            {...register('level', { valueAsNumber: true })}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="curriculum" className="block text-sm font-medium text-gray-700">
          Curriculum *
        </label>
        <select
          id="curriculum"
          {...register('curriculum')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select curriculum</option>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE</option>
          <option value="IB">IB</option>
          <option value="State Board">State Board</option>
          <option value="IGCSE">IGCSE</option>
          <option value="Other">Other</option>
        </select>
        {errors.curriculum && <p className="mt-1 text-sm text-red-600">{errors.curriculum.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="Optional description of the grade"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subjects
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
          {subjects.map(subject => (
            <label key={subject.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedSubjectIds.includes(subject.id)}
                onChange={() => handleSubjectToggle(subject.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">{subject.name}</span>
            </label>
          ))}
          {subjects.length === 0 && (
            <p className="text-sm text-gray-500">No subjects available</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : (grade ? 'Update Grade' : 'Create Grade')}
        </button>
      </div>
    </form>
  )
} 