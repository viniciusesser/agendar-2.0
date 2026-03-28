/**
 * Configuração centralizada dos planos do Agendar 2.0.
 * Quando definir os preços e o link de pagamento, altere apenas aqui.
 */
export const PLANOS_CONFIG: Record<string, { limite_profissionais: number; nome: string }> = {
  free:    { limite_profissionais: Infinity, nome: 'Free' },    // Parceiros — sem limite
  basic:   { limite_profissionais: 2,        nome: 'Basic' },
  pro:     { limite_profissionais: 5,        nome: 'Pro' },
  vitrine: { limite_profissionais: Infinity, nome: 'Vitrine' }, // Futuro — sem limite
}

// Link de upgrade — atualize quando tiver o Mercado Pago / Instagram prontos
export const LINK_UPGRADE = 'https://wa.me/5500000000000?text=Quero+fazer+upgrade+do+meu+plano+Agendar'