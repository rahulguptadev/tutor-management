'use client'

import { useRouter } from 'next/navigation'
import { DeleteButton } from '@/components/DeleteButton'

interface DeleteStudentButtonProps {
  studentId: string
  studentName: string
}

export function DeleteStudentButton({ studentId, studentName }: DeleteStudentButtonProps) {
  const router = useRouter()
  
  const handleDelete = () => {
    router.refresh()
  }
  
  return (
    <DeleteButton
      entityType="student"
      entityId={studentId}
      entityName={studentName}
      onDelete={handleDelete}
    />
  )
} 