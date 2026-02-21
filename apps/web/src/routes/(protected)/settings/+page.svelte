<script lang="ts">
import { client } from '$lib/api.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let { data } = $props()

let name = $state(data.organization?.name ?? '')
let slug = $state(data.organization?.slug ?? '')
let phone = $state(data.organization?.phone ?? '')
let address = $state(data.organization?.address ?? '')
let timezone = $state(data.organization?.timezone ?? 'America/Sao_Paulo')
let chatWelcomeMessage = $state(data.organization?.chatWelcomeMessage ?? '')
let chatInstructions = $state(data.organization?.chatInstructions ?? '')
let saving = $state(false)

const timezones = [
	'America/Sao_Paulo',
	'America/Manaus',
	'America/Bahia',
	'America/Belem',
	'America/Fortaleza',
	'America/Recife',
	'America/Cuiaba',
	'America/Porto_Velho',
	'America/Rio_Branco',
	'America/Noronha',
]

const save = async () => {
	saving = true
	try {
		const res = await client.admin.organization.$put({
			json: {
				name,
				slug,
				phone: phone || undefined,
				address: address || undefined,
				timezone,
				chatWelcomeMessage: chatWelcomeMessage || undefined,
				chatInstructions: chatInstructions || undefined,
			},
		})
		if (res.ok) {
			addToast('Configuracoes salvas', 'success')
		} else {
			addToast('Erro ao salvar configuracoes', 'error')
		}
	} catch {
		addToast('Erro ao salvar configuracoes', 'error')
	} finally {
		saving = false
	}
}
</script>

<div class="space-y-6 max-w-2xl">
	<h1 class="text-2xl font-bold">Configuracoes</h1>

	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<h2 class="card-title text-lg">Informacoes do Negocio</h2>
			<div class="space-y-4">
				<div class="form-control">
					<label class="label" for="set-name"><span class="label-text">Nome do Negocio</span></label>
					<input id="set-name" type="text" class="input input-bordered" bind:value={name} />
				</div>
				<div class="form-control">
					<label class="label" for="set-slug"><span class="label-text">Slug (URL do chat)</span></label>
					<input id="set-slug" type="text" class="input input-bordered" bind:value={slug} />
					<label class="label">
						<span class="label-text-alt">O chat ficara acessivel em /chat/{slug}</span>
					</label>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label" for="set-phone"><span class="label-text">Telefone</span></label>
						<input id="set-phone" type="text" class="input input-bordered" bind:value={phone} />
					</div>
					<div class="form-control">
						<label class="label" for="set-tz"><span class="label-text">Fuso Horario</span></label>
						<select id="set-tz" class="select select-bordered" bind:value={timezone}>
							{#each timezones as tz}
								<option value={tz}>{tz.replace('America/', '')}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="form-control">
					<label class="label" for="set-addr"><span class="label-text">Endereco</span></label>
					<input id="set-addr" type="text" class="input input-bordered" bind:value={address} />
				</div>
			</div>
		</div>
	</div>

	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<h2 class="card-title text-lg">Configuracoes do Chat</h2>
			<div class="space-y-4">
				<div class="form-control">
					<label class="label" for="set-welcome"><span class="label-text">Mensagem de Boas-vindas</span></label>
					<textarea
						id="set-welcome"
						class="textarea textarea-bordered h-24"
						bind:value={chatWelcomeMessage}
						placeholder="Ola! Como posso ajudar com seu agendamento?"
					></textarea>
				</div>
				<div class="form-control">
					<label class="label" for="set-instructions"><span class="label-text">Instrucoes para a IA</span></label>
					<textarea
						id="set-instructions"
						class="textarea textarea-bordered h-24"
						bind:value={chatInstructions}
						placeholder="Instrucoes adicionais para personalizar o comportamento do assistente..."
					></textarea>
					<label class="label">
						<span class="label-text-alt">Estas instrucoes serao usadas pelo assistente de IA ao conversar com seus clientes.</span>
					</label>
				</div>
			</div>
		</div>
	</div>

	<button class="btn btn-primary" onclick={save} disabled={saving}>
		{#if saving}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		Salvar Configuracoes
	</button>
</div>
