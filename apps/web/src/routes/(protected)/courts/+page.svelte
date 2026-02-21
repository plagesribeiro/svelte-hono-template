<script lang="ts">
import { client, json } from '$lib/api.svelte'
import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte'
import EmptyState from '$lib/components/ui/EmptyState.svelte'
import Modal from '$lib/components/ui/Modal.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let items = $state<any[]>([])
let loading = $state(true)
let showModal = $state(false)
let showDeleteConfirm = $state(false)
let editingItem = $state<any>(null)
let deletingId = $state<string | null>(null)

let formName = $state('')
let formSport = $state('')
let formDescription = $state('')
let formPrice = $state(0)
let formSlotDuration = $state(60)
let formBreak = $state(0)
let formIsActive = $state(true)

const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`

const loadData = async () => {
	loading = true
	try {
		const res = await client.admin.courts.$get()
		if (res.ok) items = await json(res)
	} catch {
		addToast('Erro ao carregar quadras', 'error')
	} finally {
		loading = false
	}
}

const openCreate = () => {
	editingItem = null
	formName = ''
	formSport = ''
	formDescription = ''
	formPrice = 0
	formSlotDuration = 60
	formBreak = 0
	formIsActive = true
	showModal = true
}

const openEdit = (item: any) => {
	editingItem = item
	formName = item.name
	formSport = item.sport
	formDescription = item.description ?? ''
	formPrice = item.pricePerSlot / 100
	formSlotDuration = item.slotDurationMinutes
	formBreak = item.breakBetweenMinutes
	formIsActive = item.isActive
	showModal = true
}

const save = async () => {
	try {
		const payload = {
			name: formName,
			sport: formSport,
			description: formDescription || undefined,
			pricePerSlot: Math.round(formPrice * 100),
			slotDurationMinutes: formSlotDuration,
			breakBetweenMinutes: formBreak,
			isActive: formIsActive,
		}
		if (editingItem) {
			const res = await client.admin.courts[':id'].$put({
				param: { id: editingItem.id },
				json: payload,
			})
			if (res.ok) addToast('Quadra atualizada', 'success')
		} else {
			const res = await client.admin.courts.$post({ json: payload })
			if (res.ok) addToast('Quadra criada', 'success')
		}
		showModal = false
		loadData()
	} catch {
		addToast('Erro ao salvar', 'error')
	}
}

const confirmDelete = (id: string) => {
	deletingId = id
	showDeleteConfirm = true
}

const handleDelete = async () => {
	if (!deletingId) return
	try {
		await client.admin.courts[':id'].$delete({ param: { id: deletingId } })
		addToast('Quadra removida', 'success')
		loadData()
	} catch {
		addToast('Erro ao remover', 'error')
	}
}

$effect(() => {
	loadData()
})
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Quadras</h1>
		<button class="btn btn-primary" onclick={openCreate}>Nova Quadra</button>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if items.length === 0}
		<EmptyState
			title="Nenhuma quadra cadastrada"
			description="Adicione sua primeira quadra para comecar."
			actionLabel="Nova Quadra"
			onaction={openCreate}
		/>
	{:else}
		<div class="card bg-base-100 shadow">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Nome</th>
								<th>Esporte</th>
								<th>Duracao</th>
								<th>Preco</th>
								<th>Status</th>
								<th>Acoes</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item}
								<tr class="hover">
									<td class="font-medium">{item.name}</td>
									<td>{item.sport}</td>
									<td>{item.slotDurationMinutes} min</td>
									<td>{formatPrice(item.pricePerSlot)}</td>
									<td>
										<span class="badge badge-sm {item.isActive ? 'badge-success' : 'badge-ghost'}">
											{item.isActive ? 'Ativa' : 'Inativa'}
										</span>
									</td>
									<td>
										<div class="flex gap-1">
											<button class="btn btn-xs btn-outline" onclick={() => openEdit(item)}>Editar</button>
											<button class="btn btn-xs btn-error btn-outline" onclick={() => confirmDelete(item.id)}>Remover</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>

<Modal bind:open={showModal} title={editingItem ? 'Editar Quadra' : 'Nova Quadra'}>
	<div class="space-y-4">
		<div class="form-control">
			<label class="label" for="court-name"><span class="label-text">Nome *</span></label>
			<input id="court-name" type="text" class="input input-bordered" bind:value={formName} />
		</div>
		<div class="form-control">
			<label class="label" for="court-sport"><span class="label-text">Esporte *</span></label>
			<input id="court-sport" type="text" class="input input-bordered" bind:value={formSport} placeholder="Futebol, Tenis, Beach Tennis..." />
		</div>
		<div class="form-control">
			<label class="label" for="court-desc"><span class="label-text">Descricao</span></label>
			<textarea id="court-desc" class="textarea textarea-bordered" bind:value={formDescription}></textarea>
		</div>
		<div class="grid grid-cols-3 gap-4">
			<div class="form-control">
				<label class="label" for="court-price"><span class="label-text">Preco (R$) *</span></label>
				<input id="court-price" type="number" class="input input-bordered" bind:value={formPrice} min="0" step="0.01" />
			</div>
			<div class="form-control">
				<label class="label" for="court-dur"><span class="label-text">Duracao (min)</span></label>
				<input id="court-dur" type="number" class="input input-bordered" bind:value={formSlotDuration} min="15" step="15" />
			</div>
			<div class="form-control">
				<label class="label" for="court-break"><span class="label-text">Intervalo (min)</span></label>
				<input id="court-break" type="number" class="input input-bordered" bind:value={formBreak} min="0" step="5" />
			</div>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Ativa</span>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={formIsActive} />
			</label>
		</div>
		<div class="modal-action">
			<button class="btn" onclick={() => (showModal = false)}>Cancelar</button>
			<button class="btn btn-primary" onclick={save} disabled={!formName.trim() || !formSport.trim()}>Salvar</button>
		</div>
	</div>
</Modal>

<ConfirmDialog bind:open={showDeleteConfirm} title="Remover Quadra" message="Tem certeza que deseja remover esta quadra?" onconfirm={handleDelete} />
