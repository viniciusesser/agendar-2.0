import Fastify from 'fastify'
import { FastifyError } from 'fastify' // <-- Nova importação vital para o TypeScript parar de reclamar
import cors from '@fastify/cors'
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

const app = Fastify({ logger: true })

// Configuração do CORS atualizada para permitir o localhost e a Vercel
app.register(cors, {
  origin: ['http://localhost:3000', 'https://agendar-2-0.vercel.app'], // <-- AQUI ESTÁ A MÁGICA
  credentials: true, // Fundamental para permitir o envio e recebimento de cookies (refresh token)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Métodos permitidos explicitamente
})

// =========================================================================
// GERENTE DE ERROS (Tratamento Global)
// =========================================================================
// Adicionamos a tipagem "FastifyError" ao error, assim o VS Code entende!
app.setErrorHandler((error: FastifyError, request, reply) => {
  // 1. Registra o erro no terminal para você (desenvolvedor) saber o que houve
  console.error('❌ Erro capturado pelo Gerente:', error)

  // 2. Se for um erro de validação (ex: enviou texto onde era pra ser número)
  if (error.validation) {
    return reply.status(400).send({
      status: 'erro',
      mensagem: 'Dados inválidos enviados na requisição.',
      detalhes: error.validation
    })
  }

  // 3. Se for um erro amigável que nós mesmos disparamos (ex: throw new Error('NAO_ENCONTRADO'))
  if (error.message === 'NAO_ENCONTRADO') {
    return reply.status(404).send({
      status: 'erro',
      mensagem: 'O registro solicitado não foi encontrado.'
    })
  }
  
  if (error.message === 'CREDENCIAIS_INVALIDAS') {
    return reply.status(401).send({
      status: 'erro',
      mensagem: 'E-mail ou senha incorretos.'
    })
  }

  // 4. Se for qualquer outro erro desconhecido (Erro 500 - Internal Server Error)
  return reply.status(500).send({
    status: 'erro',
    mensagem: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
  })
})
// =========================================================================

app.get('/health', async () => {
  return { status: 'ok', projeto: 'Agendar 2.0', timestamp: new Date().toISOString() }
})

// Registro de todas as rotas
app.register(authRoutes, { prefix: '/api/agendar' })
app.register(servicosRoutes, { prefix: '/api/agendar' })
app.register(clientesRoutes, { prefix: '/api/agendar' })
app.register(agendamentosRoutes, { prefix: '/api/agendar' })
app.register(financeiroRoutes, { prefix: '/api/agendar' })
app.register(estoqueRoutes, { prefix: '/api/agendar' })
app.register(dashboardRoutes, { prefix: '/api/agendar' })
app.register(profissionaisRoutes, { prefix: '/api/agendar' })
app.register(configuracoesRoutes, { prefix: '/api/agendar' })

// Inicialização do servidor
const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Servidor rodando na porta 3333')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()