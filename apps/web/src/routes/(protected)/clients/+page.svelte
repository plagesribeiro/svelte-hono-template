<script lang="ts">
import { client, json } from '$lib/api.svelte'
import EmptyState from '$lib/components/ui/EmptyState.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let items = $state<any[]>([])
let loading = $state(true)
let total = $state(0)
let page = $state(1)
const limit = 20
let search = $state('')
let searchTimeout: ReturnType<typeof setTimeout>

const totalPages = $derived(Math.ceil(total / limit))

const loadData = async () => {
	loading = true
	try {
		const res = await client.admin.clients.$get({
			query: { page: String(page), limit: String(limit), search: search || undefined },
		})
		if (res.ok) {
			const data = await json(res)
			items = data.data
			total = data.total
		}
	} catch {
		addToast('Erro ao carregar clientes', 'error')
	} finally {
		loading = false
	}
}

const handleSearch = (e: Event) => {
	const value = (e.target as HTMLInputElement).value
	search = value
	clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		page = 1
		loadData()
	}, 300)
}

const goPage = (p: number) => {
	page = p
	loadData()
}

$effect(() => {
	loadData()
})
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Clientes</h1>
	</div>

	<div class="form-control">
		<input
			type="text"
			class="input input-bordered w-full max-w-sm"
			placeholder="Buscar por nome ou telefone..."
			value={search}
			oninput={handleSearch}
		/>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if items.length === 0}
		<EmptyState
			title="Nenhum cliente encontrado"
			description={search ? 'Tente uma busca diferente.' : 'Clientes serao adicionados automaticamente ao agendar pelo chat.'}
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
							</tr>
						</thead>
						<tbody>
							{#each items as item}
								<tr class="hover">
									<td class="font-medium">{item.name}</td>
									<td>{item.phone}</td>
									<td>{item.email ?? '-'}</td>
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
