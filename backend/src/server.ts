import Fastify from 'fastify'
import { FastifyError } from 'fastify'
import cors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import 'dotenv/config'
import { authRoutes } from './routes/auth.routes'
import { servicosRoutes } from './routes/agenda/servicos.routes'
import { clientesRoutes } from './routes/agenda/clientes.routes'
import { agendamentosRoutes } from './routes/agenda/agendamentos.routes'
import { financeiroRoutes } from './routes/agenda/financeiro.routes'
import { estoqueRoutes } from './routes/agenda/estoque.routes'
import { dashboardRoutes } from './routes/agenda/dashboard.routes'
import { profissionaisRoutes } from './routes/agenda/profissionais.routes'
import { configuracoesRoutes } from './routes/agenda/configuracoes.routes'
import { masterRoutes } from './routes/master.routes'
import { pushRoutes } from './routes/push.routes'
import { iniciarCronJobs } from './jobs/notificacoes.cron'

const app = Fastify({ logger: true })

// ─── CORS ─────────────────────────────────────────────────────────────────
app.register(cors, {
  origin: ['http://localhost:3000', 'https://agendar-2-0.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
})

// ─── COOKIES (necessário para refresh token httpOnly) ─────────────────────
app.register(fastifyCookie, {
  secret: process.env.JWT_REFRESH_SECRET!, // assina os cookies
})

// =========================================================================
// GERENTE DE ERROS (Tratamento Global)
// =========================================================================
app.setErrorHandler((error: FastifyError, request, reply) => {
  console.error('❌ Erro capturado pelo Gerente:', error)

  if (error.validation) {
    return reply.status(400).send({
      status: 'erro',
      mensagem: 'Dados inválidos enviados na requisição.',
      detalhes: error.validation,
    })
  }

  if (error.message === 'NAO_ENCONTRADO') {
    return reply.status(404).send({
      status: 'erro',
      mensagem: 'O registro solicitado não foi encontrado.',
    })
  }

  if (error.message === 'CREDENCIAIS_INVALIDAS') {
    return reply.status(401).send({
      status: 'erro',
      mensagem: 'E-mail ou senha incorretos.',
    })
  }

  return reply.status(500).send({
    status: 'erro',
    mensagem: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.',
  })
})
// =========================================================================

app.get('/health', async () => {
  return { status: 'ok', projeto: 'Agendar 2.0', timestamp: new Date().toISOString() }
})

// =========================================================================
// REGISTRO DE ROTAS
// =========================================================================
app.register(authRoutes,          { prefix: '/api/agendar' })
app.register(servicosRoutes,      { prefix: '/api/agendar' })
app.register(clientesRoutes,      { prefix: '/api/agendar' })
app.register(agendamentosRoutes,  { prefix: '/api/agendar' })
app.register(financeiroRoutes,    { prefix: '/api/agendar' })
app.register(estoqueRoutes,       { prefix: '/api/agendar' })
app.register(dashboardRoutes,     { prefix: '/api/agendar' })
app.register(profissionaisRoutes, { prefix: '/api/agendar' })
app.register(configuracoesRoutes, { prefix: '/api/agendar' })
app.register(masterRoutes,        { prefix: '/api/agendar' })
app.register(pushRoutes,          { prefix: '/api/agendar' })
// =========================================================================

const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Servidor rodando na porta 3333')
    iniciarCronJobs()
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()