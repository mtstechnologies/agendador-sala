import React, { useMemo, useState } from 'react'
import { Plus, MoreVertical } from 'lucide-react'
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser, type AdminUser } from '../../hooks/useUsers'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu'
import { Tabs } from '../../components/ui/Tabs'
import { api } from '../../lib/api'
import { toast } from '../../lib/toast'

type FormState = {
  fullName: string
  email: string
  matricula: string
  password: string
  role: 'user' | 'admin'
}

export default function AdminUsersPage() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUser()

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ fullName: '', email: '', matricula: '', password: '', role: 'user' })

  const handleOpen = () => { setEditingId(null); setIsOpen(true) }
  const handleClose = () => { setIsOpen(false); setEditingId(null); setForm({ fullName: '', email: '', matricula: '', password: '', role: 'user' }) }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Força MAIÚSCULAS para nome e matrícula
    const nextValue = name === 'fullName' || name === 'matricula' ? value.toUpperCase() : value
    setForm(prev => ({ ...prev, [name]: nextValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Segurança: normaliza em MAIÚSCULAS antes de enviar
    const payload = {
      ...form,
      fullName: form.fullName.toUpperCase(),
      matricula: form.matricula.toUpperCase(),
    }
    if (editingId) {
      const { password, ...data } = payload
      await updateUser.mutateAsync({ id: editingId, data })
    } else {
      await createUser.mutateAsync(payload)
    }
    handleClose()
  }

  const rows = useMemo(() => users ?? [], [users])

  const tabs = [
    { name: 'Salas', href: '/admin/rooms' },
    { name: 'Usuários', href: '/admin/usuarios' },
  ]

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} />

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700"> 
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-end items-center mb-4">
            <Button variant="primary" size="sm" onClick={handleOpen}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Criar Usuário
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Matrícula</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Função</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {rows.map((u: AdminUser) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{u.fullName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.matricula}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <Badge variant="info">{u.role === 'admin' ? 'Admin' : 'Usuário'}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { setEditingId(u.id); setForm({ fullName: u.fullName, email: u.email, matricula: u.matricula, password: '', role: u.role }); setIsOpen(true) }}>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={async () => {
                              try {
                                await deleteUser.mutateAsync({ id: u.id })
                              } catch (err: any) {
                                const msg = String(err?.message || '')
                                const fkMsg = 'Usuário possui reservas associadas'
                                if (msg.includes(fkMsg)) {
                                  const confirmForce = window.confirm('Este usuário possui reservas associadas. Deseja excluir TUDO (usuário + reservas)?')
                                  if (confirmForce) {
                                    await deleteUser.mutateAsync({ id: u.id, force: true })
                                  }
                                } else {
                                  toast.error('Não foi possível excluir o usuário.')
                                }
                              }
                            }}>
                              Excluir
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

      <Modal isOpen={isOpen} onClose={handleClose} title={editingId ? 'Editar Usuário' : 'Criar Usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome do Usuário</label>
              <Input name="fullName" value={form.fullName} onChange={onChange} placeholder="" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input name="email" value={form.email} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Matrícula</label>
              <Input name="matricula" value={form.matricula} onChange={onChange} />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <Input name="password" type="password" value={form.password} onChange={onChange} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Função</label>
              <select name="role" value={form.role} onChange={onChange} className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500">
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* Campo de avatar removido do Admin: upload ficará no perfil do usuário */}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Salvar Alterações' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
