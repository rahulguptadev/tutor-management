import { EditClassForm } from '@/components/classes/EditClassForm'

export default async function EditClassPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return <EditClassForm classId={id} />
} 