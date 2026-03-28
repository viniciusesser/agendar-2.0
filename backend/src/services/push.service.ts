import webpush, { PushSubscription } from 'web-push'
import { prisma } from '../lib/prisma'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// ─── TIPO LOCAL ───────────────────────────────────────────────────────────
interface SubRecord {
  id:       string
  endpoint: string
  p256dh:   string
  auth:     string
}

// ─── ENVIO PARA UM DISPOSITIVO ────────────────────────────────────────────
async function enviarParaSubscription(sub: SubRecord, payload: object): Promise<void> {
  try {
    const pushSub: PushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }
    await webpush.sendNotification(pushSub, JSON.stringify(payload))
  } catch (err: unknown) {
    const status = (err as any)?.statusCode
    if (status === 410 || status === 404) {
      await prisma.ag_push_subscriptions.delete({ where: { id: sub.id } })
    }
  }
}

// ─── MONTA O TEXTO DA NOTIFICAÇÃO ─────────────────────────────────────────
interface MontarMensagemParams {
  perfil:          string
  nomeUsuario:     string
  feriado:         string | null
  ausentes:        string[]
  aniversariantes: { nome: string }[]
  agendamentos:    { horario: string; cliente: string }[]
  estoqueBaixo:    { nome: string; quantidade: number }[]
}

function montarMensagem(dados: MontarMensagemParams): { title: string; body: string } {
  const { perfil, nomeUsuario, feriado, ausentes, aniversariantes, agendamentos, estoqueBaixo } = dados
  const linhas: string[] = []

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const title = `${saudacao}, ${nomeUsuario.split(' ')[0]}! ☀️`

  if (feriado) linhas.push(`🎉 Hoje é feriado: ${feriado}.`)

  if (aniversariantes.length > 0) {
    const nomes = aniversariantes.map((a) => a.nome.split(' ')[0]).join(', ')
    linhas.push(`🎂 Aniversário hoje: ${nomes}.`)
  }

  if (ausentes.length > 0) {
    linhas.push(`⚠️ Ausente hoje: ${ausentes.join(', ')}.`)
  }

  if (agendamentos.length === 0) {
    linhas.push('📅 Sem agendamentos por hoje.')
  } else if (perfil === 'dono' || perfil === 'admin') {
    linhas.push(`📅 ${agendamentos.length} agendamento(s) no salão hoje.`)
  } else {
    const resumo = agendamentos
      .slice(0, 3)
      .map((a) => `${a.horario} ${a.cliente}`)
      .join(', ')
    const extra = agendamentos.length > 3 ? ` +${agendamentos.length - 3} mais.` : '.'
    linhas.push(`📅 Seus clientes: ${resumo}${extra}`)
  }

  if (estoqueBaixo.length > 0 && (perfil === 'dono' || perfil === 'admin')) {
    const nomes = estoqueBaixo.map((e) => e.nome).join(', ')
    linhas.push(`📦 Estoque baixo: ${nomes}.`)
  }

  if (linhas.length === 0) {
    const diaSemana = new Date().toLocaleDateString('pt-BR', { weekday: 'long' })
    linhas.push(`Hoje é ${diaSemana}. Boa semana! 💪`)
  }

  return { title, body: linhas.join('\n') }
}

// ─── JOB PRINCIPAL — chamado pelo cron às 6h ──────────────────────────────
export async function dispararNotificacoesDiarias() {
  const hoje = new Date()
  const inicio = new Date(`${hoje.toISOString().split('T')[0]}T00:00:00.000Z`)
  const fim    = new Date(`${hoje.toISOString().split('T')[0]}T23:59:59.999Z`)

  // Busca feriado do dia via BrasilAPI
  let feriadoHoje: string | null = null
  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${hoje.getFullYear()}`)
    if (res.ok) {
      const feriados = await res.json() as { date: string; name: string }[]
      const dataHoje = hoje.toISOString().split('T')[0]
      const encontrado = feriados.find(f => f.date === dataHoje)
      if (encontrado) feriadoHoje = encontrado.name
    }
  } catch { /* sem internet — segue sem feriado */ }

  // Busca todas as empresas ativas
  const empresas = await prisma.ag_empresas.findMany({
    where: { ativo: true, deleted_at: null },
    select: { id: true },
  })

  for (const empresa of empresas) {
    const [bloqueios, agendamentosDia, todosClientes, estoqueItens, subscriptions] = await Promise.all([
      prisma.ag_bloqueios.findMany({
        where: { empresa_id: empresa.id, data_hora_inicio: { gte: inicio, lte: fim } },
        include: { profissional: { select: { nome: true } } },
      }),
      prisma.ag_agendamentos.findMany({
        where: {
          empresa_id: empresa.id,
          deleted_at: null,
          status: { notIn: ['cancelado'] },
          data_hora_inicio: { gte: inicio, lte: fim },
        },
        include: {
          cliente:      { select: { nome: true } },
          profissional: { select: { id: true, nome: true, usuario_id: true } },
        },
        orderBy: { data_hora_inicio: 'asc' },
      }),
      prisma.ag_clientes.findMany({
        where: { empresa_id: empresa.id, deleted_at: null, aniversario: { not: null } },
        select: { nome: true, aniversario: true },
      }),
      prisma.ag_estoque.findMany({
        where: { empresa_id: empresa.id, deleted_at: null },
        select: { nome: true, quantidade: true, estoque_minimo: true },
      }),
      prisma.ag_push_subscriptions.findMany({
        where: { empresa_id: empresa.id },
        include: { usuario: { select: { id: true, nome: true, perfil: true } } },
      }),
    ])

    // Filtra aniversariantes de hoje
    const aniversariantesHoje = todosClientes.filter(c => {
      if (!c.aniversario) return false
      const aniv = new Date(c.aniversario)
      return aniv.getDate() === hoje.getDate() && aniv.getMonth() === hoje.getMonth()
    })

    // Filtra estoque abaixo do mínimo
    const estoqueBaixoHoje = estoqueItens.filter(
      p => Number(p.quantidade) <= Number(p.estoque_minimo)
    )

    const ausentes = bloqueios.map(b => b.profissional.nome)

    // Dispara para cada dispositivo registrado
    for (const sub of subscriptions) {
      const usuario = sub.usuario
      const isDono = usuario.perfil === 'dono' || usuario.perfil === 'admin'

      const agendamentosFiltrados = isDono
        ? agendamentosDia
        : agendamentosDia.filter(a => a.profissional.usuario_id === usuario.id)

      const payload = montarMensagem({
        perfil:          usuario.perfil,
        nomeUsuario:     usuario.nome,
        feriado:         feriadoHoje,
        ausentes:        isDono ? ausentes : [],
        aniversariantes: aniversariantesHoje,
        agendamentos:    agendamentosFiltrados.map(a => ({
          horario: new Date(a.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          cliente: a.cliente.nome.split(' ')[0],
        })),
        estoqueBaixo: isDono
          ? estoqueBaixoHoje.map(e => ({ nome: e.nome, quantidade: Number(e.quantidade) }))
          : [],
      })

      await enviarParaSubscription(sub, {
        title: payload.title,
        body:  payload.body,
        icon:  '/icon-192.png',
        badge: '/icon-192.png',
        url:   '/agenda',
      })
    }
  }

  console.log(`✅ Notificações diárias disparadas para ${empresas.length} empresa(s).`)
}