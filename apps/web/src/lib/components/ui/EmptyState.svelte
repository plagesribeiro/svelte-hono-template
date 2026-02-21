<script lang="ts">
type Props = {
	title: string
	description?: string
	actionLabel?: string
	onaction?: () => void
}
let { title, description, actionLabel, onaction }: Props = $props()
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
  <h3 class="text-lg font-semibold mb-2">{title}</h3>
  {#if description}
    <p class="text-base-content/60 mb-4 max-w-md">{description}</p>
  {/if}
  {#if actionLabel && onaction}
    <button class="btn btn-primary" onclick={onaction}>{actionLabel}</button>
  {/if}
</div>
