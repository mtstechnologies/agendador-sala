import React from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { Calendar } from 'lucide-react'

export function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Calendar className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sistema de Reservas
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Gerencie reservas de salas da sua instituição
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}