import React from 'react'
import { Card, CardContent } from './Card'

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  value: React.ReactNode
  colorClass?: string
}

export function StatCard({ icon: Icon, title, value, colorClass }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${colorClass || 'text-gray-500'}`} />
          </div>
          <div className="ml-4 min-w-0">
            <p className="text-sm font-medium text-gray-600 truncate" title={title}>{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
