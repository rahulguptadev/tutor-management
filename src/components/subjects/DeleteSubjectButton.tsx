'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteSubjectButton({ subjectId }: { subjectId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this subject?')) {
      setIsDeleting(true)
      try {
        const res = await fetch(`/api/subjects?id=${subjectId}`, { method: 'DELETE' })
        if (res.ok) {
          router.refresh()
        } else {
          const err = await res.text()
          alert(err)
        }
      } catch (err) {
        console.error(err)
        alert('An error occurred.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? 'Deleting…' : 'Delete'}
    </button>
  )
} 