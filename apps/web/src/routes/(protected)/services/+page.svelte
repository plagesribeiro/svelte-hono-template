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
let formDescription = $state('')
let formDuration = $state(30)
let formPrice = $state(0)
let formIsActive = $state(true)

const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`

const loadData = async () => {
	loading = true
	try {
		const res = await client.admin.services.$get()
		if (res.ok) items = await json(res)
	} catch {
		addToast('Erro ao carregar servicos', 'error')
	} finally {
		loading = false
	}
}

const openCreate = () => {
	editingItem = null
	formName = ''
	formDescription = ''
	formDuration = 30
	formPrice = 0
	formIsActive = true
	showModal = true
}

const openEdit = (item: any) => {
	editingItem = item
	formName = item.name
	formDescription = item.description ?? ''
	formDuration = item.durationMinutes
	formPrice = item.price / 100
	formIsActive = item.isActive
	showModal = true
}

const save = async () => {
	try {
		const payload = {
			name: formName,
			description: formDescription || undefined,
			durationMinutes: formDuration,
			price: Math.round(formPrice * 100),
			isActive: formIsActive,
		}
		if (editingItem) {
			const res = await client.admin.services[':id'].$put({
				param: { id: editingItem.id },
				json: payload,
			})
			if (res.ok) addToast('Servico atualizado', 'success')
		} else {
			const res = await client.admin.services.$post({ json: payload })
			if (res.ok) addToast('Servico criado', 'success')
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
		await client.admin.services[':id'].$delete({ param: { id: deletingId } })
		addToast('Servico removido', 'success')
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
		<h1 class="text-2xl font-bold">Servicos</h1>
		<button class="btn btn-primary" onclick={openCreate}>Novo Servico</button>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if items.length === 0}
		<EmptyState
			title="Nenhum servico cadastrado"
			description="Adicione seu primeiro servico para comecar."
			actionLabel="Novo Servico"
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
									<td>{item.durationMinutes} min</td>
									<td>{formatPrice(item.price)}</td>
									<td>
										<span class="badge badge-sm {item.isActive ? 'badge-success' : 'badge-ghost'}">
											{item.isActive ? 'Ativo' : 'Inativo'}
										</span>
									</td>
									<td>
										<div class="flex gap-1">
											<button class="btn btn-xs btn-outline" onclick={() => openEdit(item)}>
												Editar
											</button>
											<button
												class="btn btn-xs btn-error btn-outline"
												onclick={() => confirmDelete(item.id)}
											>
												Remover
											</button>
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

<Modal bind:open={showModal} title={editingItem ? 'Editar Servico' : 'Novo Servico'}>
	<div class="space-y-4">
		<div class="form-control">
			<label class="label" for="svc-name"><span class="label-text">Nome *</span></label>
			<input id="svc-name" type="text" class="input input-bordered" bind:value={formName} />
		</div>
		<div class="form-control">
			<label class="label" for="svc-desc"><span class="label-text">Descricao</span></label>
			<textarea id="svc-desc" class="textarea textarea-bordered" bind:value={formDescription}></textarea>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label" for="svc-dur"><span class="label-text">Duracao (min) *</span></label>
				<input
					id="svc-dur"
					type="number"
					class="input input-bordered"
					bind:value={formDuration}
					min="5"
					step="5"
				/>
			</div>
			<div class="form-control">
				<label class="label" for="svc-price"><span class="label-text">Preco (R$) *</span></label>
				<input
					id="svc-price"
					type="number"
					class="input input-bordered"
					bind:value={formPrice}
					min="0"
					step="0.01"
				/>
			</div>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Ativo</span>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={formIsActive} />
			</label>
		</div>
		<div class="modal-action">
			<button class="btn" onclick={() => (showModal = false)}>Cancelar</button>
			<button class="btn btn-primary" onclick={save} disabled={!formName.trim() || formDuration < 1}>
				Salvar
			</button>
		</div>
	</div>
</Modal>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Remover Servico"
	message="Tem certeza que deseja remover este servico?"
	onconfirm={handleDelete}
/>
