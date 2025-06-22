import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // This page is a server component, so we render a form that posts to an API route
  // The actual update logic should be handled in /api/students/[id]/edit (to be created if not present)

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Student</h1>
        <Link
          href={`/students/${student.id}`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </Link>
      </div>
      <form
        className="bg-white rounded shadow p-6 max-w-lg"
        action={`/api/students/${student.id}/edit`}
        method="POST"
      >
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <input
            type="text"
            name="grade"
            defaultValue={student.grade || ''}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
          <input
            type="text"
            name="school"
            defaultValue={student.school || ''}
            className="w-full px-3 py-2 border rounded"
          />
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
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </DashboardLayout>
  );
} 