import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DeleteStudentButton } from '@/components/students/DeleteStudentButton'
import Link from 'next/link'

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
    subject: {
      name: string;
    } | null;
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
  const where: Record<string, unknown> = { isActive: true };
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
          include: {
            subject: {
              select: {
                name: true,
              },
            },
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
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-600 mt-1">Manage student information and records</p>
          </div>
                      <Link
              href="/students/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
            >
              <span className="mr-2">+</span>
              Add Student
            </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <form className="flex flex-col md:flex-row gap-4 items-end w-full" method="get">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search by name or email"
                defaultValue={search}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select name="grade" defaultValue={grade} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Grades</option>
                {gradeOptions.map((g: { id: string; name: string }) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
              <select name="school" defaultValue={school} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Schools</option>
                {schoolOptions.map((s: string) => (
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
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {students.map((student: StudentRow, idx: number) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{student.user.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{student.user.email}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    {student.grade ? (
                      <div>
                        <div className="font-medium">{student.grade.name}</div>
                        <div className="text-sm text-gray-500">{student.grade.curriculum}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{student.school || '-'}</td>
                  <td className="px-6 py-3 text-gray-700">
                    {student.enrolledSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledSubjects.map((enrolledSubject, index) => (
                          <span
                            key={enrolledSubject.subject?.name ?? index}
                            className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                          >
                            {enrolledSubject.subject?.name ?? 'Unknown'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No subjects</span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteStudentButton
                        studentId={student.id}
                        studentName={student.user.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-3 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Showing {students.length} of {total} students
          </span>
          <div className="flex items-center space-x-1">
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