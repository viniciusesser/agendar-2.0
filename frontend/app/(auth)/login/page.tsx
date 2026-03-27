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
  // Puxamos também o 'token' da nossa loja persistente
  const { setAuth, token } = useAuthStore()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // --- O LEÃO DE CHÁCARA ---
  // Se a tela de login abrir, mas o celular já tiver a chave guardada,
  // manda o usuário direto para a agenda sem nem mostrar os campos.
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
      // 1. Tenta o login no backend
      const dados = await login(email, senha)
      
      // 2. Limpa resquícios de outras contas
      localStorage.clear()

      // 3. Salva no Store e no LocalStorage
      setAuth(dados.token, dados.usuario, dados.empresa)
      localStorage.setItem('agendar_token', dados.token)
      localStorage.setItem('agendar_usuario', JSON.stringify(dados.usuario))

      // 4. Redireciona para o local correto (MUDAMOS PARA REPLACE!)
      // O replace apaga o /login do histórico, impedindo que o botão "voltar" traga pra cá.
      router.replace('/agenda') 
      
    } catch (err: any) {
      console.error("Erro no login:", err)
      const msg = err.response?.data?.error?.message ?? 'E-mail ou senha incorretos.'
      setErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  // Se já tiver token, a tela fica em branco por 1 milissegundo enquanto o vigia te redireciona
  if (token) return null; 

  return (
    <div className="min-h-screen bg-bg-default md:bg-neutral-50 flex items-center justify-center p-4 sm:p-8 antialiased">
      
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-300">
        
        {/* === ÁREA DA LOGO ATUALIZADA === */}
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
          <a href="/registro" className="text-primary-action font-bold hover:underline transition-colors">
            Crie sua conta grátis
          </a>
        </p>
      </div>
    </div>
  )
}