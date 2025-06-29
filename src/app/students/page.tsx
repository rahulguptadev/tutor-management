import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';

interface SearchParams {
  search?: string;
  grade?: string;
  school?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
}

type StudentRow = {
  id: string;
  grade: {
    name: string;
    curriculum: string;
  } | null;
  school: string | null;
  user: {
    name: string;
    email: string;
  };
  enrolledSubjects: {
    name: string;
  }[];
};

export default async function StudentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  // Defaults
  const page = parseInt(resolvedSearchParams?.page || '1', 10);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  const search = resolvedSearchParams?.search || '';
  const grade = resolvedSearchParams?.grade || '';
  const school = resolvedSearchParams?.school || '';
  const sort = resolvedSearchParams?.sort || 'createdAt';
  const order = resolvedSearchParams?.order || 'desc';

  // Build filters
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (grade) where.gradeId = grade;
  if (school) where.school = school;

  // Get unique grades and schools for filters
  const [gradeData, schools] = await Promise.all([
    prisma.grade.findMany({
      select: { 
        id: true,
        name: true,
        curriculum: true,
      },
      where: { isActive: true },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    }),
    prisma.student.findMany({
      select: { school: true },
      distinct: ['school'],
      where: { school: { not: null } },
    }),
  ]);
  const gradeOptions = gradeData.map((g) => ({ id: g.id, name: `${g.name} (${g.curriculum})` }));
  const schoolOptions: string[] = Array.from(new Set(schools.map((s: { school: string | null }) => s.school).filter(Boolean) as string[]));

  // Fetch students
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        grade: {
          select: {
            name: true,
            curriculum: true,
          },
        },
        enrolledSubjects: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { [sort]: order },
      skip,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1"></div>
          <Link
            href="/students/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
          >
            Add Student
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <form className="flex flex-col md:flex-row gap-4 items-center w-full" method="get">
            <input
              type="text"
              name="search"
              placeholder="Search by name or email"
              defaultValue={search}
              className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 w-full md:w-56"
            />
            <select name="grade" defaultValue={grade} className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 w-full md:w-40">
              <option value="">All Grades</option>
              {gradeOptions.map((g: { id: string; name: string }) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <select name="school" defaultValue={school} className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 w-full md:w-48">
              <option value="">All Schools</option>
              {schoolOptions.map((s: string) => (
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {students.map((student: StudentRow, idx: number) => (
                  <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {student.grade ? (
                        <div>
                          <div className="font-medium">{student.grade.name}</div>
                          <div className="text-sm text-gray-500">{student.grade.curriculum}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.school || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {student.enrolledSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.enrolledSubjects.map((subject, index) => (
                            <span
                              key={subject.name}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {subject.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No subjects</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                      >
                        View
                      </Link>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className="text-gray-600 hover:text-gray-900 font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No students found.
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
              // Only use string keys and string values for URLSearchParams
              const params = Object.fromEntries(
                Object.entries(resolvedSearchParams || {}).filter(([k, v]) => typeof k === 'string' && typeof v === 'string')
              ) as Record<string, string>;
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
  );
} 