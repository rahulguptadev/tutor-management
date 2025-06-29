'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Students', href: '/students' },
  { name: 'Teachers', href: '/teachers' },
  { name: 'Find Teachers', href: '/teachers/search' },
  { name: 'Classes', href: '/classes' },
  { name: 'Fees', href: '/fees' },
  { name: 'Payouts', href: '/payouts' },
  { name: 'Subjects', href: '/subjects' },
  { name: 'Leads', href: '/leads' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow flex flex-col justify-between min-h-screen">
        <div>
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-bold">Tutor Management</span>
          </div>
          <div className="px-4 py-6">
            <div className="mb-6">
              <span className="block text-sm text-gray-500 mb-1">Signed in as</span>
              <span className="block text-base font-medium text-gray-900">{session?.user?.name}</span>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'}
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="px-4 py-6 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="w-full text-left text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 py-6 px-8">
        {children}
      </main>
    </div>
  )
} 