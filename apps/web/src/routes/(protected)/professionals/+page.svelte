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
let formPhone = $state('')
let formEmail = $state('')
let formIsActive = $state(true)

const loadData = async () => {
	loading = true
	try {
		const res = await client.admin.professionals.$get()
		if (res.ok) items = await json(res)
	} catch {
		addToast('Erro ao carregar profissionais', 'error')
	} finally {
		loading = false
	}
}

const openCreate = () => {
	editingItem = null
	formName = ''
	formPhone = ''
	formEmail = ''
	formIsActive = true
	showModal = true
}

const openEdit = (item: any) => {
	editingItem = item
	formName = item.name
	formPhone = item.phone ?? ''
	formEmail = item.email ?? ''
	formIsActive = item.isActive
	showModal = true
}

const save = async () => {
	try {
		if (editingItem) {
			const res = await client.admin.professionals[':id'].$put({
				param: { id: editingItem.id },
				json: {
					name: formName,
					phone: formPhone || undefined,
					email: formEmail || undefined,
					isActive: formIsActive,
				},
			})
			if (res.ok) addToast('Profissional atualizado', 'success')
		} else {
			const res = await client.admin.professionals.$post({
				json: {
					name: formName,
					phone: formPhone || undefined,
					email: formEmail || undefined,
					isActive: formIsActive,
				},
			})
			if (res.ok) addToast('Profissional criado', 'success')
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
		await client.admin.professionals[':id'].$delete({ param: { id: deletingId } })
		addToast('Profissional removido', 'success')
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
		<h1 class="text-2xl font-bold">Profissionais</h1>
		<button class="btn btn-primary" onclick={openCreate}>Novo Profissional</button>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if items.length === 0}
		<EmptyState
			title="Nenhum profissional cadastrado"
			description="Adicione seu primeiro profissional para comecar a agendar."
			actionLabel="Novo Profissional"
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
								<th>Telefone</th>
								<th>Email</th>
								<th>Status</th>
								<th>Acoes</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item}
								<tr class="hover">
									<td class="font-medium">{item.name}</td>
									<td>{item.phone ?? '-'}</td>
									<td>{item.email ?? '-'}</td>
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

<Modal bind:open={showModal} title={editingItem ? 'Editar Profissional' : 'Novo Profissional'}>
	<div class="space-y-4">
		<div class="form-control">
			<label class="label" for="prof-name"><span class="label-text">Nome *</span></label>
			<input id="prof-name" type="text" class="input input-bordered" bind:value={formName} />
		</div>
		<div class="form-control">
			<label class="label" for="prof-phone"><span class="label-text">Telefone</span></label>
			<input id="prof-phone" type="text" class="input input-bordered" bind:value={formPhone} />
		</div>
		<div class="form-control">
			<label class="label" for="prof-email"><span class="label-text">Email</span></label>
			<input id="prof-email" type="email" class="input input-bordered" bind:value={formEmail} />
		</div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Ativo</span>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={formIsActive} />
			</label>
		</div>
		<div class="modal-action">
			<button class="btn" onclick={() => (showModal = false)}>Cancelar</button>
			<button class="btn btn-primary" onclick={save} disabled={!formName.trim()}>Salvar</button>
		</div>
	</div>
</Modal>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Remover Profissional"
	message="Tem certeza que deseja remover este profissional?"
	onconfirm={handleDelete}
/>
