import { EditTeacherForm } from '@/components/teachers/EditTeacherForm'

export default async function EditTeacherPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return <EditTeacherForm teacherId={id} />
} 