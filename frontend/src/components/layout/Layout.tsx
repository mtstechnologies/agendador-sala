import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 md:ml-64`}>
          <div className="pt-16 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}