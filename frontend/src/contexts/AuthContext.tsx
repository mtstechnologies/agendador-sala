import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '../types/auth'
import { api, setUnauthorizedHandler } from '../lib/api'
import { toast } from '../lib/toast'

type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, department?: string) => Promise<void>
  signOut: () => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  returnTo: string | null
  setReturnTo: React.Dispatch<React.SetStateAction<string | null>>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [returnTo, setReturnTo] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {}
    }
    setLoading(false)
  }, [])

  // Registrar handler global de 401 para UX suave
  useEffect(() => {
    const handler = () => {
      // guarda rota atual para restaurar depois do login
      try {
        const current = window.location.pathname + window.location.search + window.location.hash
        sessionStorage.setItem('returnTo', current)
        setReturnTo(current)
      } catch {}
      setUser(null)
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch {}
      toast.error('Sessão expirada. Faça login novamente.')
    }
    setUnauthorizedHandler(handler)
    return () => setUnauthorizedHandler(null)
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const data = await api.post<{ token: string; user: User }>(
        '/auth/login',
        { email, password }
      )
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Login realizado com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, department?: string) => {
    setError(null)
    setLoading(true)
    try {
      const data = await api.post<User>(
        '/auth/register',
        { email, password, fullName, department }
      )
      // Opcional: manter user logado após cadastro
      // setUser(data as unknown as User)
      toast.success('Conta criada com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Você saiu da sessão.')
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    isAdmin: user?.role === 'admin',
    signIn,
    signUp,
    signOut,
    setUser,
    returnTo,
    setReturnTo,
  }), [user, loading, error])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>')
  return ctx
}
