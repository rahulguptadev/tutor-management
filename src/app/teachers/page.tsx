import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
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
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teachers</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1"></div>
          <Link
            href="/teachers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
          >
            Add Teacher
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <form className="flex flex-col md:flex-row gap-4 items-center w-full" method="get">
            <input
              type="text"
              name="search"
              placeholder="Search by name, email, or subject"
              defaultValue={search}
              className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 w-full md:w-56"
            />
            <select name="subject" defaultValue={subject} className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 w-full md:w-40">
              <option value="">All Subjects</option>
              {subjectOptions.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 shadow">Search</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <div className="bg-white rounded-xl shadow">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Hourly Rate</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {teachers.map((teacher: any, idx: number) => (
                  <tr key={teacher.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{teacher.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{teacher.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{teacher.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{teacher.subjects.map((ts: { subject: { name: string } }) => ts.subject.name).join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">₹{teacher.hourlyRate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/teachers/${teacher.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                      >
                        View
                      </Link>
                      <Link
                        href={`/teachers/${teacher.id}/edit`}
                        className="text-gray-600 hover:text-gray-900 font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
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
                  className={`px-3 py-1 rounded ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {p.toString()}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 