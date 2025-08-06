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
      enrolledSubjects: { include: { subject: { select: { name: true } } } },
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
      <div className="bg-white rounded-xl shadow p-8 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2"><span className="font-semibold text-gray-700">Name:</span> {student.user.name}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Email:</span> {student.user.email}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Grade:</span> {student.grade ? `${student.grade.name} (${student.grade.curriculum})` : '-'}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">School:</span> {student.school || '-'}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Mobile Number:</span> {student.mobileNumber || '-'}</p>
          </div>
          <div>
            <p className="mb-2"><span className="font-semibold text-gray-700">Father's Name:</span> {student.fatherName || '-'}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Father's Contact:</span> {student.fatherContact || '-'}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Mother's Name:</span> {student.motherName || '-'}</p>
            <p className="mb-2"><span className="font-semibold text-gray-700">Mother's Contact:</span> {student.motherContact || '-'}</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Enrolled Subjects</h3>
          {student.enrolledSubjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-gray-50 rounded">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {student.enrolledSubjects.map((es: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 whitespace-nowrap">{es.subject?.name ?? 'Unknown'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{es.sessions ?? '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{es.fee !== undefined ? `₹${es.fee}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">-</p>
          )}
        </div>
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
                  <td className="px-6 py-4 whitespace-nowrap">{classItem.class.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(classItem.class.startTime).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(classItem.class.endTime).toLocaleString()}</td>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {student.fees.map((fee: any) => (
                <tr key={fee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.paidAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      fee.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      fee.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{fee.notes || '-'}</td>
                </tr>
              ))}
              {student.fees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
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