import React, { useState } from 'react';
import { useRooms, useDeleteRoom } from '../../hooks/useRooms';
import { RoomForm } from '../../components/rooms/RoomForm';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Plus, MoreVertical, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Room } from '../../types/database';
import { api } from '../../lib/api'
import { toast } from '../../lib/toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/DropdownMenu';

const tabs = [
  { name: 'Salas', href: '/admin/rooms' },
  { name: 'Usuários', href: '/admin/usuarios' },
];

export default function AdminCadastrosPage() {
  const { data: rooms, isLoading } = useRooms({ includeInactive: true });
  const deleteRoomMutation = useDeleteRoom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [sort, setSort] = useState<null | { key: 'name' | 'capacity' | 'bloco'; dir: 'asc' | 'desc' }>(null);

  const toggleSort = (key: 'name' | 'capacity' | 'bloco') => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  const renderSortIcon = (key: 'name' | 'capacity' | 'bloco') => {
    if (!sort || sort.key !== key) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 inline" />;
    return sort.dir === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 inline" />
    );
  };

  const sortedRooms = React.useMemo(() => {
    if (!rooms) return [] as Room[];
    if (!sort) return rooms;
    const data = [...rooms];
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: false });
    data.sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case 'name':
          cmp = collator.compare(a.name || '', b.name || '');
          break;
        case 'capacity':
          cmp = (a.capacity || 0) - (b.capacity || 0);
          break;
        case 'bloco':
          cmp = collator.compare(a.bloco || '', b.bloco || '');
          break;
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [rooms, sort]);

  const handleOpenModal = (room: Room | null = null) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRoom(null);
    setIsModalOpen(false);
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sala?')) return
    try {
      await deleteRoomMutation.mutateAsync({ id })
    } catch (err: any) {
      const msg = String(err?.message || '')
      const fkMsg = 'Sala possui reservas associadas'
      if (msg.includes(fkMsg)) {
        const confirmForce = window.confirm('Esta sala possui reservas associadas. Deseja excluir TUDO (sala + reservas)?')
        if (confirmForce) {
          await deleteRoomMutation.mutateAsync({ id, force: true })
        }
      }
    }
  };

  return (
    <div className="space-y-6">

      <Tabs tabs={tabs} />

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-end items-center mb-4">
            <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Criar Sala
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : !rooms ? (
            <div className="text-center py-8">Nenhuma sala encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer select-none">
                        Nome {renderSortIcon('name')}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button type="button" onClick={() => toggleSort('capacity')} className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer select-none">
                        Capacidade {renderSortIcon('capacity')}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <button type="button" onClick={() => toggleSort('bloco')} className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer select-none">
                        Bloco {renderSortIcon('bloco')}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Recursos</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{room.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{room.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{room.bloco}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex flex-wrap gap-1">
                          {room.resources.map((resource) => (
                            <Badge key={resource} variant="secondary">{resource}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Ativa</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Inativa</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleOpenModal(room)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteRoom(room.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRoom ? 'Editar Sala' : 'Criar Sala'}
      >
        <RoomForm
          room={editingRoom || undefined}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
