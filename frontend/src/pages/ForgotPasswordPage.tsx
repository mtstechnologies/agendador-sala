import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

const schema = z.object({ email: z.string().email('Email inválido') })

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
      toast.success('Se existir conta com este email, enviaremos instruções.')
      reset()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao solicitar redefinição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-sm text-gray-700">
              Se um email corresponder a uma conta válida, você receberá um link com instruções para redefinir sua senha.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
              <Button type="submit" className="w-full" loading={loading}>Enviar link</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
