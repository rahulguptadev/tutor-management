import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'

interface SearchParams {
  search?: string;
  subject?: string;
  minRate?: string;
  maxRate?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
}

export default async function TeachersPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const resolvedSearchParams = await searchParams

  // Defaults
  const page = parseInt(resolvedSearchParams?.page || '1', 10);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  const search = resolvedSearchParams?.search || '';
  const subject = resolvedSearchParams?.subject || '';
  const minRate = resolvedSearchParams?.minRate ? parseFloat(resolvedSearchParams.minRate) : undefined;
  const maxRate = resolvedSearchParams?.maxRate ? parseFloat(resolvedSearchParams.maxRate) : undefined;
  const sort = resolvedSearchParams?.sort || 'createdAt';
  const order = resolvedSearchParams?.order || 'desc';

  // Build filters
  const where: any = {};
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { subjects: { has: search } },
    ];
  }
  if (subject) where.subjects = { has: subject };
  if (minRate !== undefined) where.hourlyRate = { ...where.hourlyRate, gte: minRate };
  if (maxRate !== undefined) where.hourlyRate = { ...where.hourlyRate, lte: maxRate };

  // Get unique subjects for filter
  const allSubjects = await prisma.teacher.findMany({
    select: { 
      subjects: {
        include: {
          subject: true
        }
      }
    },
  });
  const subjectOptions: string[] = Array.from(new Set(allSubjects.flatMap((t: { subjects: any[] }) => t.subjects.map(ts => ts.subject.name))));

  // Fetch teachers
  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: {
          include: {
            subject: true
          }
        }
      },
      orderBy: { [sort]: order },
      skip,
      take: pageSize,
    }),
    prisma.teacher.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
            <p className="text-sm text-gray-600 mt-1">Manage teacher information and assignments</p>
          </div>
                      <Link
              href="/teachers/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
            >
              <span className="mr-2">+</span>
              Add Teacher
            </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <form className="flex flex-col md:flex-row gap-4 items-end w-full" method="get">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search by name, email, or subject"
                defaultValue={search}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select name="subject" defaultValue={subject} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Subjects</option>
                {subjectOptions.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors">
              Search
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {teachers.map((teacher: any, idx: number) => (
                <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{teacher.user.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{teacher.user.email}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{teacher.phoneNumber || '-'}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    {teacher.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((ts: { subject: { name: string } }, index: number) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {ts.subject.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No subjects</span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{teacher.education || '-'}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{teacher.qualification || '-'}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/teachers/${teacher.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/teachers/${teacher.id}/edit`}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        entityType="teacher"
                        entityId={teacher.id}
                        entityName={teacher.user.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-3 text-center text-gray-500">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Showing {teachers.length} of {total} teachers
          </span>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p: number) => {
              const params = Object.fromEntries(
                Object.entries(resolvedSearchParams || {}).filter(([k]) => typeof k === 'string')
              );
              params.page = p.toString();
              const href = `?${new URLSearchParams(params).toString()}`;
              return (
                <a
                  key={p.toString()}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    p === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {p.toString()}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 