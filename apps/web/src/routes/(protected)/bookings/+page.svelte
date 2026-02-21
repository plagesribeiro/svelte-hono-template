<script lang="ts">
import { client, json } from '$lib/api.svelte'
import EmptyState from '$lib/components/ui/EmptyState.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let items = $state<any[]>([])
let loading = $state(true)
let total = $state(0)
let page = $state(1)
const limit = 20
let statusFilter = $state('')
let startDate = $state('')
let endDate = $state('')

const totalPages = $derived(Math.ceil(total / limit))

const formatPrice = (cents: number | null) =>
	cents != null ? `R$ ${(cents / 100).toFixed(2).replace('.', ',')}` : '-'

const formatDateTime = (iso: string) => {
	const d = new Date(iso)
	return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const statusBadge = (status: string) => {
	const map: Record<string, string> = {
		confirmed: 'badge-success',
		cancelled: 'badge-error',
		completed: 'badge-info',
		no_show: 'badge-warning',
	}
	return map[status] ?? 'badge-ghost'
}

const statusLabel = (status: string) => {
	const map: Record<string, string> = {
		confirmed: 'Confirmado',
		cancelled: 'Cancelado',
		completed: 'Concluido',
		no_show: 'Nao compareceu',
	}
	return map[status] ?? status
}

const loadData = async () => {
	loading = true
	try {
		const res = await client.admin.bookings.$get({
			query: {
				page: String(page),
				limit: String(limit),
				status: statusFilter || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
			},
		})
		if (res.ok) {
			const data = await json(res)
			items = data.data
			total = data.total
		}
	} catch {
		addToast('Erro ao carregar agendamentos', 'error')
	} finally {
		loading = false
	}
}

const goPage = (p: number) => {
	page = p
	loadData()
}

const applyFilters = () => {
	page = 1
	loadData()
}

$effect(() => {
	loadData()
})
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Agendamentos</h1>
	</div>

	<div class="flex flex-wrap gap-3 items-end">
		<div class="form-control">
			<label class="label" for="f-status"><span class="label-text">Status</span></label>
			<select id="f-status" class="select select-bordered select-sm" bind:value={statusFilter} onchange={applyFilters}>
				<option value="">Todos</option>
				<option value="confirmed">Confirmado</option>
				<option value="cancelled">Cancelado</option>
				<option value="completed">Concluido</option>
				<option value="no_show">Nao compareceu</option>
			</select>
		</div>
		<div class="form-control">
			<label class="label" for="f-start"><span class="label-text">De</span></label>
			<input id="f-start" type="date" class="input input-bordered input-sm" bind:value={startDate} onchange={applyFilters} />
		</div>
		<div class="form-control">
			<label class="label" for="f-end"><span class="label-text">Ate</span></label>
			<input id="f-end" type="date" class="input input-bordered input-sm" bind:value={endDate} onchange={applyFilters} />
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if items.length === 0}
		<EmptyState
			title="Nenhum agendamento encontrado"
			description="Agendamentos aparecerao aqui quando forem criados pelo chat ou manualmente."
		/>
	{:else}
		<div class="card bg-base-100 shadow">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Data/Hora</th>
								<th>Cliente</th>
								<th>Profissional/Quadra</th>
								<th>Servico</th>
								<th>Valor</th>
								<th>Status</th>
								<th>Acoes</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item}
								<tr class="hover">
									<td class="text-sm">{formatDateTime(item.startTime)}</td>
									<td class="font-medium">{item.clientName ?? '-'}</td>
									<td>{item.professionalName ?? item.courtName ?? '-'}</td>
									<td>{item.serviceName ?? '-'}</td>
									<td>{formatPrice(item.priceCharged)}</td>
									<td>
										<span class="badge badge-sm {statusBadge(item.status)}">
											{statusLabel(item.status)}
										</span>
									</td>
									<td>
										<a href="/bookings/{item.id}" class="btn btn-xs btn-outline">Ver</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		{#if totalPages > 1}
			<div class="flex justify-center">
				<div class="join">
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
						<button
							class="join-item btn btn-sm"
							class:btn-active={p === page}
							onclick={() => goPage(p)}
						>
							{p}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
