<script lang="ts">
type Props = {
	title: string
	value: string | number
	description?: string
}
let { title, value, description }: Props = $props()
</script>

<div class="stat bg-base-100 rounded-box shadow">
  <div class="stat-title">{title}</div>
  <div class="stat-value">{value}</div>
  {#if description}
    <div class="stat-desc">{description}</div>
  {/if}
</div>
