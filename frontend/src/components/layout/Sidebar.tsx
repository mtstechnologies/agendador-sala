import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Home, 
  Calendar, 
  MapPin, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['user', 'admin'] },
  { name: 'Minhas Reservas', href: '/reservations', icon: Calendar, roles: ['user', 'admin'] },
  { name: 'Salas', href: '/rooms', icon: MapPin, roles: ['user', 'admin'] },
  { name: 'Gerenciar Reservas', href: '/admin/reservations', icon: Users, roles: ['admin'] },
  { name: 'Relatórios', href: '/admin/reports', icon: BarChart3, roles: ['admin'] },
  { name: 'Configurações', href: '/admin/settings', icon: Settings, roles: ['admin'] },
]

export function Sidebar() {
  const { user, isAdmin } = useAuth()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'user')
  )

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors'
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
      </div>
    </div>
  )
}