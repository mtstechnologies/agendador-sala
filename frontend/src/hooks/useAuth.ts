
import { useState, useEffect } from 'react'
import type { User } from '../types/auth'


export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Persistência simples de token em localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
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
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, department })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta')
      setUser(data)
      // Não faz login automático, mas pode guardar dados se quiser
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
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === 'admin'
  }
}