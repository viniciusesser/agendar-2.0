"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth.store'
import { login } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, token } = useAuthStore()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Guarda de rota — se já tiver sessão ativa, redireciona direto
  useEffect(() => {
    if (token) {
      router.replace('/agenda')
    }
  }, [token, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const dados = await login(email, senha)

      // ✅ Uma única linha. O Zustand persist cuida do storage.
      // Sem localStorage.clear(), sem localStorage.setItem() manuais.
      setAuth(dados.token, dados.usuario, dados.empresa)

      router.replace('/agenda')
    } catch (err: any) {
      console.error("Erro no login:", err)
      const msg = err.response?.data?.error?.message ?? 'E-mail ou senha incorretos.'
      setErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  // Evita flash da tela de login enquanto o guard redireciona
  if (token) return null

  return (
    <div className="min-h-screen bg-bg-default md:bg-neutral-50 flex items-center justify-center p-4 sm:p-8 antialiased">

      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-300">

        <div className="text-center mb-8 md:mb-10 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Logo Agendar"
            width={250}
            height={80}
            className="mb-2 drop-shadow-sm h-auto w-auto"
            priority
          />
          <p className="text-text-secondary text-body font-medium tracking-wide">
            Gestão para salões de beleza
          </p>
        </div>

        <Card className="p-6 sm:p-8 md:shadow-2xl border-border-default md:border-transparent transition-all">
          <h2 className="text-title font-bold text-text-secondary mb-6 text-center">
            Entrar na sua conta
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              label="E-MAIL"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemplo@salao.com"
              required
            />

            <Input
              type="password"
              label="SENHA"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />

            {erro && (
              <div className="bg-status-error/10 border border-status-error/20 text-status-error text-small font-medium p-3 rounded-lg text-center">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={carregando}
              className="md:h-12"
            >
              Entrar
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-body text-text-secondary font-medium">
          Ainda não faz parte?{' '}
          <a href="/registro" className="text-primary-action font-bold hover:underline">
            Crie sua conta
          </a>
        </p>

      </div>
    </div>
  )
}