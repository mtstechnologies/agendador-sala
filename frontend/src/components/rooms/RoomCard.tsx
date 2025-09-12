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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{room.name}</CardTitle>
          <Badge variant="info">
            <Users className="h-3 w-3 mr-1" />
            {room.capacity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
              {room.operating_hours.start} às {room.operating_hours.end}
            </p>
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2">
              {onReserve && (
                <Button
                  onClick={() => onReserve(room)}
                  className="flex-1"
                  size="sm"
                >
                  Reservar
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
        </div>
      </CardContent>
    </Card>
  )
}