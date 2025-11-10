import React from 'react'
import { MapPin, Users, Wifi, Monitor, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Room } from '../../types/database'

interface RoomCardProps {
  room: Room
  onReserve?: (room: Room) => void
  onEdit?: (room: Room) => void
  showActions?: boolean
}

const resourceIcons: Record<string, React.ComponentType<any>> = {
  'Projetor': Monitor,
  'Wi-Fi': Wifi,
  'Café': Coffee,
  'default': MapPin
}

export function RoomCard({ room, onReserve, onEdit, showActions = true }: RoomCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {!room.isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Inativa</span>
            )}
          </div>
          <Badge variant="info">
            <Users className="h-3 w-3 mr-1" />
            {room.capacity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1">
          {room.resources && room.resources.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recursos:</h4>
              <div className="flex flex-wrap gap-2">
                {room.resources.map((resource, index) => {
                  const IconComponent = resourceIcons[resource] || resourceIcons.default
                  return (
                    <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
                      <IconComponent className="h-3 w-3 mr-1" />
                      {resource}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Horário de Funcionamento:</h4>
            <p className="text-sm text-gray-600">
              {room.operatingHours?.start && room.operatingHours?.end
                ? `${room.operatingHours.start} às ${room.operatingHours.end}`
                : 'Não informado'}
            </p>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100">
            {onReserve && (
              <Button
                onClick={() => onReserve(room)}
                disabled={!room.isActive}
                className="flex-1"
                size="sm"
              >
                {room.isActive ? 'Reservar' : 'Indisponível'}
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={() => onEdit(room)}
                variant="outline"
                size="sm"
              >
                Editar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}