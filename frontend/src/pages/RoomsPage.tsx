import React, { useState } from 'react'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { useRooms } from '../hooks/useRooms'
import { useAuth } from '../hooks/useAuth'
import { RoomCard } from '../components/rooms/RoomCard'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { RoomForm } from '../components/rooms/RoomForm'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Search, Plus } from 'lucide-react'
import type { Room } from '../types/database'

export function RoomsPage() {
  const { data: rooms, isLoading } = useRooms()
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)

  const filteredRooms = rooms?.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.resources.some(resource => 
      resource.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || []

  const handleReserve = (room: Room) => {
    setSelectedRoom(room)
    setShowReservationForm(true)
  }

  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [listKey, setListKey] = useState(Date.now())
  const handleReservationSuccess = () => {
    setReservationSuccess(true)
    setTimeout(() => {
      setShowReservationForm(false)
      setSelectedRoom(null)
      setReservationSuccess(false)
      setListKey(Date.now()) // força remount da lista
    }, 2000)
  }

  const handleReservationCancel = () => {
    setShowReservationForm(false)
    setSelectedRoom(null)
  }

  if (showReservationForm && selectedRoom) {
    if (reservationSuccess) {
      return (
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-16">
          <div className="text-green-600 text-xl font-bold mb-4">Reserva realizada com sucesso!</div>
          <div className="text-gray-500">Redirecionando...</div>
        </div>
      )
    }
    return (
      <div className="max-w-2xl mx-auto">
        <ReservationForm
          room={selectedRoom}
          onSuccess={handleReservationSuccess}
          onCancel={handleReservationCancel}
        />
      </div>
    )
  }

  if (showRoomForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <RoomForm
          onSuccess={() => setShowRoomForm(false)}
          onCancel={() => setShowRoomForm(false)}
        />
      </div>
    )
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6" key={listKey}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salas</h1>
          <p className="text-gray-600">
            Explore e reserve as salas disponíveis
          </p>
        </div>
        
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={() => setShowRoomForm(true)}>
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Criar Sala
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar salas ou recursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onReserve={handleReserve}
            />
          ))}
        </div>
      )}

      {filteredRooms.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma sala encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os termos de busca ou explore todas as salas disponíveis.
          </p>
        </div>
      )}
    </div>
    </ErrorBoundary>
  )
}