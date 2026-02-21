export const chatTools = [
	{
		name: 'check_availability',
		description: 'Verificar horarios disponiveis para agendamento em uma data especifica',
		input_schema: {
			type: 'object' as const,
			properties: {
				date: { type: 'string', description: 'Data no formato YYYY-MM-DD' },
				professional_id: { type: 'string', description: 'ID do profissional (opcional)' },
				service_id: { type: 'string', description: 'ID do servico (opcional)' },
				court_id: { type: 'string', description: 'ID da quadra (opcional)' },
			},
			required: ['date'],
		},
	},
	{
		name: 'create_booking',
		description: 'Criar um novo agendamento para um cliente',
		input_schema: {
			type: 'object' as const,
			properties: {
				client_name: { type: 'string', description: 'Nome do cliente' },
				client_phone: { type: 'string', description: 'Telefone do cliente' },
				start_time: { type: 'string', description: 'Horario de inicio em ISO 8601' },
				end_time: { type: 'string', description: 'Horario de termino em ISO 8601' },
				professional_id: { type: 'string', description: 'ID do profissional' },
				service_id: { type: 'string', description: 'ID do servico' },
				court_id: { type: 'string', description: 'ID da quadra' },
			},
			required: ['client_name', 'client_phone', 'start_time', 'end_time'],
		},
	},
	{
		name: 'cancel_booking',
		description: 'Cancelar um agendamento existente',
		input_schema: {
			type: 'object' as const,
			properties: {
				booking_id: { type: 'string', description: 'ID do agendamento' },
				reason: { type: 'string', description: 'Motivo do cancelamento' },
			},
			required: ['booking_id'],
		},
	},
	{
		name: 'reschedule_booking',
		description: 'Reagendar um agendamento existente para um novo horario',
		input_schema: {
			type: 'object' as const,
			properties: {
				booking_id: { type: 'string', description: 'ID do agendamento' },
				new_start_time: {
					type: 'string',
					description: 'Novo horario de inicio em ISO 8601',
				},
				new_end_time: {
					type: 'string',
					description: 'Novo horario de termino em ISO 8601',
				},
			},
			required: ['booking_id', 'new_start_time', 'new_end_time'],
		},
	},
	{
		name: 'list_services',
		description: 'Listar todos os servicos disponiveis',
		input_schema: {
			type: 'object' as const,
			properties: {},
		},
	},
	{
		name: 'list_professionals',
		description: 'Listar todos os profissionais disponiveis',
		input_schema: {
			type: 'object' as const,
			properties: {},
		},
	},
	{
		name: 'list_courts',
		description: 'Listar todas as quadras disponiveis',
		input_schema: {
			type: 'object' as const,
			properties: {},
		},
	},
]
