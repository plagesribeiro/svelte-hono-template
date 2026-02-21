<script lang="ts">
type Props = {
	name: string
	logoUrl?: string | null
}
let { name, logoUrl }: Props = $props()
</script>

<header class="bg-base-100 border-b border-base-300 p-4 flex items-center gap-3">
	{#if logoUrl}
		<img src={logoUrl} alt={name} class="w-10 h-10 rounded-full object-cover" />
	{:else}
		<div class="avatar placeholder">
			<div class="bg-primary text-primary-content w-10 rounded-full">
				<span class="text-lg">{name.charAt(0)}</span>
			</div>
		</div>
	{/if}
	<div>
		<h1 class="font-bold">{name}</h1>
		<p class="text-xs text-base-content/60">Assistente de agendamento</p>
	</div>
</header>
