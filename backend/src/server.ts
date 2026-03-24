import Fastify from 'fastify'
import 'dotenv/config'
import { authRoutes } from './routes/auth.routes'
import { servicosRoutes } from './routes/agenda/servicos.routes'
import { clientesRoutes } from './routes/agenda/clientes.routes'
import { agendamentosRoutes } from './routes/agenda/agendamentos.routes'
import { financeiroRoutes } from './routes/agenda/financeiro.routes'
import { estoqueRoutes } from './routes/agenda/estoque.routes'

const app = Fastify({ logger: true })

app.get('/health', async () => {
  return { status: 'ok', projeto: 'Agendar 2.0', timestamp: new Date().toISOString() }
})

app.register(authRoutes, { prefix: '/api/agendar' })
app.register(servicosRoutes, { prefix: '/api/agendar' })
app.register(clientesRoutes, { prefix: '/api/agendar' })
app.register(agendamentosRoutes, { prefix: '/api/agendar' })
app.register(financeiroRoutes, { prefix: '/api/agendar' })
app.register(estoqueRoutes, { prefix: '/api/agendar' })

const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Servidor rodando em http://localhost:3333')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()