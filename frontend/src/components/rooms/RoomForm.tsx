import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useCreateRoom, useUpdateRoom } from '../../hooks/useRooms'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Room } from '../../types/database'

interface RoomFormProps {
  onSuccess: () => void
  onCancel: () => void
  room?: Room
}

export function RoomForm({ onSuccess, onCancel, room }: RoomFormProps) {
  const [name, setName] = useState(room?.name || '')
  const [capacity, setCapacity] = useState(room?.capacity || 1)
  const [resources, setResources] = useState(room ? room.resources.join(', ') : '')
  const [bloco, setBloco] = useState(room?.bloco || '')
  const [department, setDepartment] = useState(room?.department || '')
  const [isActive, setIsActive] = useState<boolean>(room?.isActive ?? true)
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()

  useEffect(() => {
    if (room) {
      setName(room.name || '')
      setCapacity(room.capacity || 1)
      setResources(room.resources?.join(', ') || '')
      setBloco(room.bloco || '')
      setDepartment(room.department || '')
      setIsActive(typeof room.isActive === 'boolean' ? room.isActive : true)
    }
  }, [room])

  function normalizeName(n: string) {
    const trimmed = n.trim().replace(/\s+/g, ' ')
    if (!trimmed) return ''
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  }

  const MAX_NAME = 12

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalName = normalizeName(name).slice(0, MAX_NAME)
    const normalizeResource = (txt: string) => {
      return txt
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
        .join(' ')
    }
    const normalizedResources = resources
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
      .map(r => normalizeResource(r))

    const payload = {
      name: finalName,
      capacity: Number(capacity),
      resources: normalizedResources,
      bloco,
      department,
      operatingHours: null,
      isActive,
    }
    
    const mutation = room 
      ? () => updateRoom.mutateAsync({ id: room.id, ...payload })
      : () => createRoom.mutateAsync(payload);

    try {
      await toast.promise(
        mutation(),
        {
          loading: `${room ? 'Atualizando' : 'Cadastrando'} sala...`,
          success: `Sala ${room ? 'atualizada' : 'cadastrada'} com sucesso!`,
          error: `Erro ao ${room ? 'atualizar' : 'cadastrar'} sala.`,
        }
      );
      onSuccess();
    } catch (err) {
      // O toast já trata o erro, então não precisamos fazer mais nada aqui.
    }
  }

  const isPending = createRoom.isPending || updateRoom.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome da Sala"
        value={name}
        onChange={e => {
          const v = e.target.value
          if (v.length <= MAX_NAME) setName(v)
        }}
        onBlur={() => setName(prev => normalizeName(prev).slice(0, MAX_NAME))}
  helperText={`Máx. ${MAX_NAME} caracteres`}
        required
      />
      <Input
        label="Capacidade"
        type="number"
        min={1}
        value={capacity}
        onChange={e => setCapacity(Number(e.target.value))}
        required
      />
      <Input
        label="Recursos (separados por vírgula)"
        value={resources}
        onChange={e => setResources(e.target.value)}
        placeholder="Projetor, Ar-condicionado, TV"
      />
      <Input
        label="Bloco"
        value={bloco}
        onChange={e => setBloco(e.target.value.toUpperCase())}
        onBlur={() => setBloco(prev => prev.trim().replace(/\s+/g, ' ').toUpperCase())}
        required
      />
      <Input
        label="Departamento"
        value={department}
        onChange={e => setDepartment(e.target.value.toUpperCase())}
        onBlur={() => setDepartment(prev => prev.trim().replace(/\s+/g, ' ').toUpperCase())}
        required
      />
      <div className="flex items-center gap-3">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Sala ativa (desmarque para manutenção/inativa)
        </label>
      </div>
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>Cancelar</Button>
        <Button type="submit" loading={isPending}>{room ? 'Salvar Alterações' : 'Salvar'}</Button>
      </div>
    </form>
  )
}
