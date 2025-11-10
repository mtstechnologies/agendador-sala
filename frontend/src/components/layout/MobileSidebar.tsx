import React from 'react'
import { Dialog } from '@headlessui/react'
import { X, Home, Calendar, MapPin, Users, BarChart3, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['user', 'admin'] },
  { name: 'Minhas Reservas', href: '/reservations', icon: Calendar, roles: ['user', 'admin'] },
  { name: 'Agendar', href: '/agendar', icon: MapPin, roles: ['user', 'admin'] },
  { name: 'Cadastros', href: '/admin/rooms', icon: MapPin, roles: ['admin'] },
  { name: 'Gerenciar Reservas', href: '/admin/reservations', icon: Users, roles: ['admin'] },
  { name: 'Relatórios', href: '/admin/reports', icon: BarChart3, roles: ['admin'] },
  { name: 'Configurações', href: '/admin/settings', icon: Settings, roles: ['admin'] },
]

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { user } = useAuth()
  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role || 'user'))

  return (
    <Dialog as="div" className="relative z-50 md:hidden" open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex">
        <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 py-5 border-r border-gray-200">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-base font-semibold text-gray-900">Menu</Dialog.Title>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors rounded-md'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={clsx(
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                          'mr-3 flex-shrink-0 h-5 w-5'
                        )}
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
