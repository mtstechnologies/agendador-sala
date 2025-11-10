import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { signIn, loading, error, user } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)


  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError(null)
      await signIn(data.email, data.password)
      // redirecionamento acontece em AppRoutes ao detectar user
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Entrar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={clsx(
                  'input',
                  errors.password?.message && 'border-red-500 focus-visible:ring-red-500'
                )}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {(error || submitError) && (
            <div className="text-sm text-red-600 text-center">
              {typeof (error || submitError) === 'string'
                ? (error || submitError)
                : 'Erro desconhecido ao fazer login'}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Entrar
          </Button>

          {/* Cadastro desabilitado: apenas o admin cria usuários */}
          <div className="text-center text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:underline">Esqueci minha senha</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}