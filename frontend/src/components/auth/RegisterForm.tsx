import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  department: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const { signUp, loading, error } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError(null)
      const normalizedName = data.fullName.trim().toUpperCase()
      await signUp(data.email, data.password, normalizedName, data.department)
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar conta')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Criar Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome Completo"
            {...register('fullName')}
            error={errors.fullName?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Departamento (opcional)"
            {...register('department')}
            error={errors.department?.message}
          />

          <Input
            label="Senha"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          {(error || submitError) && (
            <div className="text-sm text-red-600 text-center">
              {error || submitError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Criar Conta
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Já tem uma conta? Entre
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}