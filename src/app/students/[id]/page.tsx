import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      grade: { select: { name: true, curriculum: true, level: true } },
      enrolledSubjects: { select: { name: true } },
      classes: {
        include: {
          class: {
            include: {
              teacher: { include: { user: { select: { name: true } } } },
              subject: true,
            },
          },
        },
      },
      fees: true,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <Link
          href={`/students/${student.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit
        </Link>
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <p><strong>Name:</strong> {student.user.name}</p>
        <p><strong>Email:</strong> {student.user.email}</p>
        <p><strong>Grade:</strong> {student.grade ? `${student.grade.name} (${student.grade.curriculum})` : '-'}</p>
        <p><strong>School:</strong> {student.school || '-'}</p>
        <p><strong>Mobile Number:</strong> {student.mobileNumber || '-'}</p>
        <p><strong>Father's Name:</strong> {student.fatherName || '-'}</p>
        <p><strong>Father's Contact:</strong> {student.fatherContact || '-'}</p>
        <p><strong>Mother's Name:</strong> {student.motherName || '-'}</p>
        <p><strong>Mother's Contact:</strong> {student.motherContact || '-'}</p>
        <p><strong>Enrolled Subjects:</strong> {student.enrolledSubjects.length > 0 ? student.enrolledSubjects.map((s: any) => s.name).join(', ') : '-'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Classes</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {student.classes.map((classItem: any) => (
                <tr key={classItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{classItem.class.subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{classItem.class.teacher.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{classItem.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(classItem.startTime).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(classItem.endTime).toLocaleString()}</td>
                </tr>
              ))}
              {student.classes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Fees</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {student.fees.map((fee: any) => (
                <tr key={fee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fee.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {student.fees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No fees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 