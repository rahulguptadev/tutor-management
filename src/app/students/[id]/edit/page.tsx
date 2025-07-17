import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

interface EditStudentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      grade: {
        select: {
          id: true,
          name: true,
          curriculum: true,
        },
      },
      enrolledSubjects: true,
    },
  })

  if (!student) {
    notFound()
  }

  // Get all subjects for the multi-select
  const allSubjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
  })

  // Get all grades for the dropdown
  const allGrades = await prisma.grade.findMany({
    where: { isActive: true },
    orderBy: [
      { level: 'asc' },
      { name: 'asc' },
    ],
  })

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Student</h1>
          <Link
            href={`/students/${id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
        </div>

        <form
          className="bg-white rounded shadow p-6"
          action={`/api/students/${student.id}/edit`}
          method="POST"
        >
          {/* Student Basic Information */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={student.user.name}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={student.user.email}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  name="gradeId"
                  defaultValue={student.grade?.id || ''}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select a grade</option>
                  {allGrades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name} ({grade.curriculum})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <input
                  type="text"
                  name="school"
                  defaultValue={student.school || ''}
                  placeholder="School name"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                defaultValue={student.mobileNumber || ''}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  defaultValue={student.fatherName || ''}
                  placeholder="Father's full name"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Contact</label>
                <input
                  type="tel"
                  name="fatherContact"
                  defaultValue={student.fatherContact || ''}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  defaultValue={student.motherName || ''}
                  placeholder="Mother's full name"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Contact</label>
                <input
                  type="tel"
                  name="motherContact"
                  defaultValue={student.motherContact || ''}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Subjects */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Subjects</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {allSubjects.map(subject => {
                const isEnrolled = student.enrolledSubjects.some(es => es.id === subject.id)
                return (
                  <label key={subject.id} className="flex items-center">
                    <input
                      type="checkbox"
                      name="enrolledSubjectIds"
                      value={subject.id}
                      defaultChecked={isEnrolled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">{subject.name}</span>
                  </label>
                )
              })}
              {allSubjects.length === 0 && (
                <p className="text-sm text-gray-500">No subjects available</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
} 