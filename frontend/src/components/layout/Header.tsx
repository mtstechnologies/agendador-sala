import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Calendar, LogOut, User, Menu, Moon, Sun } from 'lucide-react'

interface HeaderProps {
  onOpenMobileSidebar?: () => void
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user, signOut, isAdmin } = useAuth()
  const displayName = user
    ? (user as any).full_name || (user as any).fullName || (user as any).name || (user.email ? user.email.split('@')[0] : 'Usuário')
    : ''
  const showAdminBadge = isAdmin && !/^\s*admin\s*$/i.test(displayName)

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={onOpenMobileSidebar}
              className="mr-2 inline-flex md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Calendar className="h-8 w-8 text-primary-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              Sistema de Reservas
            </h1>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <button
                type="button"
                aria-label="Alternar tema"
                onClick={() => {
                  const el = document.documentElement
                  const willBeDark = !el.classList.contains('dark')
                  if (willBeDark) el.classList.add('dark')
                  else el.classList.remove('dark')
                  try { localStorage.setItem('theme', willBeDark ? 'dark' : 'light') } catch {}
                }}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                title="Alternar tema"
              >
                <Sun className="h-4 w-4 hidden dark:block" />
                <Moon className="h-4 w-4 dark:hidden" />
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200" title={user.email}>{displayName}</span>
                {showAdminBadge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-200/20 dark:text-primary-300">
                    Admin
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}