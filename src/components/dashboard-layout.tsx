'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiMenu, FiUsers, FiUser, FiBook, FiDollarSign, FiCreditCard, FiBriefcase, FiLayers, FiHome, FiChevronDown, FiChevronUp, FiLogOut, FiSearch } from 'react-icons/fi'

const navigationGroups = [
  {
    name: 'General',
    icon: FiHome,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: FiHome },
      { name: 'Reports', href: '/reports', icon: FiLayers },
    ],
  },
  {
    name: 'Management',
    icon: FiUsers,
    items: [
      { name: 'Students', href: '/students', icon: FiUsers },
      { name: 'Teachers', href: '/teachers', icon: FiUser },
      { name: 'Find Teachers', href: '/teachers/search', icon: FiSearch },
      { name: 'Classes', href: '/classes', icon: FiBook },
      { name: 'Subjects', href: '/subjects', icon: FiLayers },
      { name: 'Leads', href: '/leads', icon: FiBriefcase },
    ],
  },
  {
    name: 'Finance',
    icon: FiDollarSign,
    items: [
      { name: 'Fees', href: '/fees', icon: FiCreditCard },
      { name: 'Payouts', href: '/payouts', icon: FiDollarSign },
    ],
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(navigationGroups.map(g => g.name))

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden p-2 rounded bg-white shadow"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Open sidebar"
      >
        <FiMenu size={24} />
      </button>
      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static z-20 top-0 left-0 h-full w-64 bg-white shadow flex flex-col justify-between transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div>
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-bold">Tutor Management</span>
          </div>
          <div className="px-4 py-6">
            <div className="mb-6">
              <span className="block text-sm text-gray-500 mb-1">Signed in as</span>
              <span className="block text-base font-medium text-gray-900">{session?.user?.name}</span>
            </div>
            <nav className="space-y-2">
              {navigationGroups.map((group) => (
                <div key={group.name}>
                  <button
                    type="button"
                    className="flex items-center w-full px-2 py-2 text-left text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded-md focus:outline-none"
                    onClick={() => toggleGroup(group.name)}
                  >
                    <group.icon className="mr-2" />
                    <span className="flex-1">{group.name}</span>
                    {openGroups.includes(group.name) ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {openGroups.includes(group.name) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${pathname === item.href
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'}
                          `}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
        <div className="px-4 py-6 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center text-left text-sm text-gray-500 hover:text-gray-700"
          >
            <FiLogOut className="mr-2" /> Sign out
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
} 