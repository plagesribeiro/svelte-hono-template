type TenantContext = {
	orgName: string
	businessType: string
	professionals?: {
		id: string
		name: string
		services: {
			id: string
			name: string
			durationMinutes: number
			price: number
		}[]
	}[]
	courts?: {
		id: string
		name: string
		sport: string
		slotDurationMinutes: number
		pricePerSlot: number
	}[]
	businessHours: {
		dayOfWeek: number
		openTime: string
		closeTime: string
		isOpen: boolean
	}[]
	chatInstructions?: string | null
}

const DAY_NAMES = [
	'Domingo',
	'Segunda-feira',
	'Terca-feira',
	'Quarta-feira',
	'Quinta-feira',
	'Sexta-feira',
	'Sabado',
]

export function buildSystemPrompt(ctx: TenantContext): string {
	const hoursSection = ctx.businessHours
		.map(
			(h) => `${DAY_NAMES[h.dayOfWeek]}: ${h.isOpen ? `${h.openTime} - ${h.closeTime}` : 'Fechado'}`
		)
		.join('\n')

	let entitySection = ''
	if (ctx.businessType === 'barbershop' && ctx.professionals?.length) {
		entitySection =
			'Profissionais e servicos disponiveis:\n' +
			ctx.professionals
				.map((p) => {
					const services = p.services
						.map((s) => `  - ${s.name} (${s.durationMinutes}min, R$${(s.price / 100).toFixed(2)})`)
						.join('\n')
					return `- ${p.name}:\n${services}`
				})
				.join('\n')
	} else if (ctx.businessType === 'court' && ctx.courts?.length) {
		entitySection =
			'Quadras disponiveis:\n' +
			ctx.courts
				.map(
					(c) =>
						`- ${c.name} (${c.sport}, ${c.slotDurationMinutes}min, R$${(c.pricePerSlot / 100).toFixed(2)})`
				)
				.join('\n')
	}

	return `Voce e o assistente de agendamento do ${ctx.orgName}. Sua funcao e ajudar clientes a agendar, verificar disponibilidade, cancelar ou reagendar compromissos.

REGRAS:
1. Responda SEMPRE em portugues do Brasil
2. Seja educado, cordial e objetivo
3. ANTES de agendar, SEMPRE pergunte o nome e telefone do cliente
4. Use as ferramentas disponiveis para verificar disponibilidade e fazer agendamentos
5. Nunca invente horarios - sempre use check_availability para verificar
6. Confirme todos os detalhes antes de finalizar o agendamento
7. Se o cliente pedir algo fora do seu escopo, explique educadamente que voce so lida com agendamentos

Tipo de negocio: ${ctx.businessType === 'barbershop' ? 'Barbearia' : 'Quadras esportivas'}

Horario de funcionamento:
${hoursSection}

${entitySection}

${ctx.chatInstructions ? `Instrucoes adicionais do proprietario:\n${ctx.chatInstructions}` : ''}

Data e hora atual: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
}
