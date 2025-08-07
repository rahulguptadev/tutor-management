'use client'

import { useRouter } from 'next/navigation'
import { DeleteButton } from '@/components/DeleteButton'

interface DeleteTeacherButtonProps {
  teacherId: string
  teacherName: string
}

export function DeleteTeacherButton({ teacherId, teacherName }: DeleteTeacherButtonProps) {
  const router = useRouter()
  
  const handleDelete = () => {
    router.refresh()
  }
  
  return (
    <DeleteButton
      entityType="teacher"
      entityId={teacherId}
      entityName={teacherName}
      onDelete={handleDelete}
    />
  )
} 