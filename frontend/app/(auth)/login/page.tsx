"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { login } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Sparkles } from 'lucide-react'

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
      // 1. Tenta o login no backend
      const dados = await login(email, senha)
      
      // 2. Limpa resquícios de outras contas (como a da Emily) antes de entrar
      localStorage.clear()

      // 3. Salva no Store e no LocalStorage
      setAuth(dados.token, dados.usuario, dados.empresa)
      localStorage.setItem('agendar_token', dados.token)
      localStorage.setItem('agendar_usuario', JSON.stringify(dados.usuario))

      // 4. O PULO DO GATO: Redireciona para o DASHBOARD (ou /agenda)
      // Nunca mande para '/', pois lá tem o redirecionador que te joga de volta pra cá!
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error("Erro no login:", err)
      const msg = err.response?.data?.error?.message ?? 'E-mail ou senha incorretos.'
      setErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-default md:bg-neutral-50 flex items-center justify-center p-4 sm:p-8 antialiased">
      
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
             <Sparkles className="text-primary-action w-8 h-8" />
             <h1 className="text-4xl md:text-5xl font-black text-primary-action tracking-tighter italic drop-shadow-sm">
                Agendar
             </h1>
          </div>
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
              <div className="bg-status-error/10 border border-status-error/20 text-status-error text-small font-medium p-3 rounded-lg animate-shake text-center">
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
          {/* Corrigido: Sua pasta se chama 'registro' e não 'cadastro' */}
          <a href="/registro" className="text-primary-action font-bold hover:underline transition-colors">
            Crie sua conta grátis
          </a>
        </p>
      </div>
    </div>
  )
}