<script lang="ts">
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import { client, json } from '$lib/api.svelte'
import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let booking = $state<any>(null)
let loading = $state(true)
let showCancelConfirm = $state(false)
let cancelReason = $state('')

const bookingId = $derived($page.params.id as string)

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

const loadBooking = async () => {
	loading = true
	try {
		const res = await client.admin.bookings[':id'].$get({ param: { id: bookingId } })
		if (res.ok) {
			booking = await json(res)
		} else {
			addToast('Agendamento nao encontrado', 'error')
			goto('/bookings')
		}
	} catch {
		addToast('Erro ao carregar agendamento', 'error')
		goto('/bookings')
	} finally {
		loading = false
	}
}

const handleCancel = async () => {
	if (!booking) return
	try {
		const res = await client.admin.bookings[':id'].cancel.$post({
			param: { id: booking.id },
			json: { cancelReason: cancelReason || undefined },
		})
		if (res.ok) {
			addToast('Agendamento cancelado', 'success')
			loadBooking()
		} else {
			addToast('Erro ao cancelar agendamento', 'error')
		}
	} catch {
		addToast('Erro ao cancelar agendamento', 'error')
	}
	cancelReason = ''
}

$effect(() => {
	bookingId
	loadBooking()
})
</script>

<div class="space-y-4 max-w-2xl">
	<div class="flex items-center gap-2">
		<a href="/bookings" class="btn btn-sm btn-ghost">&larr; Voltar</a>
		<h1 class="text-2xl font-bold">Detalhes do Agendamento</h1>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if booking}
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<div class="flex items-center justify-between mb-4">
					<h2 class="card-title text-lg">Informacoes</h2>
					<span class="badge {statusBadge(booking.status)}">
						{statusLabel(booking.status)}
					</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<div class="text-sm opacity-60">Cliente</div>
						<div class="font-medium">{booking.clientName ?? '-'}</div>
					</div>
					{#if booking.professionalName}
						<div>
							<div class="text-sm opacity-60">Profissional</div>
							<div class="font-medium">{booking.professionalName}</div>
						</div>
					{/if}
					{#if booking.courtName}
						<div>
							<div class="text-sm opacity-60">Quadra</div>
							<div class="font-medium">{booking.courtName}</div>
						</div>
					{/if}
					{#if booking.serviceName}
						<div>
							<div class="text-sm opacity-60">Servico</div>
							<div class="font-medium">{booking.serviceName}</div>
						</div>
					{/if}
					<div>
						<div class="text-sm opacity-60">Inicio</div>
						<div class="font-medium">{formatDateTime(booking.startTime)}</div>
					</div>
					<div>
						<div class="text-sm opacity-60">Fim</div>
						<div class="font-medium">{formatDateTime(booking.endTime)}</div>
					</div>
					<div>
						<div class="text-sm opacity-60">Valor</div>
						<div class="font-medium">{formatPrice(booking.priceCharged)}</div>
					</div>
					<div>
						<div class="text-sm opacity-60">Criado em</div>
						<div class="font-medium">{formatDateTime(booking.createdAt)}</div>
					</div>
				</div>

				{#if booking.notes}
					<div class="mt-4">
						<div class="text-sm opacity-60">Observacoes</div>
						<div>{booking.notes}</div>
					</div>
				{/if}

				{#if booking.cancelledAt}
					<div class="mt-4 p-3 bg-error/10 rounded-lg">
						<div class="text-sm opacity-60">Cancelado em</div>
						<div>{formatDateTime(booking.cancelledAt)}</div>
						{#if booking.cancelReason}
							<div class="text-sm opacity-60 mt-2">Motivo</div>
							<div>{booking.cancelReason}</div>
						{/if}
					</div>
				{/if}

				{#if booking.status === 'confirmed'}
					<div class="card-actions justify-end mt-4">
						<button class="btn btn-error btn-outline" onclick={() => (showCancelConfirm = true)}>
							Cancelar Agendamento
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<ConfirmDialog
	bind:open={showCancelConfirm}
	title="Cancelar Agendamento"
	message="Tem certeza que deseja cancelar este agendamento?"
	onconfirm={handleCancel}
/>
