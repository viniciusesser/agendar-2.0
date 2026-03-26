"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { login } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const dados = await login(email, senha)
      setAuth(dados.token, dados.usuario, dados.empresa)
      router.push('/')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message ?? 'E-mail ou senha incorretos.'
      setErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  return (
    /* O fundo muda levemente em telas grandes para destacar o card centralizado */
    <div className="min-h-screen bg-bg-default md:bg-neutral-50 flex items-center justify-center p-4 sm:p-8 antialiased">
      
      {/* O limite de 400px é a regra de ouro do UX para formulários no Desktop */}
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-300">
        
        {/* Logo e Boas-vindas */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-primary-action tracking-tighter italic drop-shadow-sm">
            Agendar
          </h1>
          <p className="text-text-secondary text-body font-medium mt-2 tracking-wide">
            Gestão para salões de beleza
          </p>
        </div>

        {/* Card ganha uma sombra mais marcante no desktop (md:shadow-2xl) */}
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

            {/* Mensagem de Erro Geral */}
            {erro && (
              <div className="bg-status-error/10 border border-status-error/20 text-status-error text-small font-medium p-3 rounded-lg animate-shake text-center">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={carregando}
              className="md:h-12" /* Botão ligeiramente maior no PC para facilitar o clique */
            >
              Entrar
            </Button>
          </form>
        </Card>

        {/* Rodapé do Login */}
        <p className="text-center mt-8 text-body text-text-secondary font-medium">
          Ainda não faz parte?{' '}
          <a href="/cadastro" className="text-primary-action font-bold hover:underline transition-colors">
            Crie sua conta grátis
          </a>
        </p>
      </div>
    </div>
  )
}