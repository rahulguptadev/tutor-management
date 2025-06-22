'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type SubjectFormValues = z.infer<typeof subjectSchema>

export function SubjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormValues>({ resolver: zodResolver(subjectSchema) })

  const onSubmit = async (data: SubjectFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/subjects')
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="name" {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
        <textarea id="description" {...register('description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
} 