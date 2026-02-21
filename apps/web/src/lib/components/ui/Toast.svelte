<script lang="ts">
import { getToasts } from '$lib/stores/toast.svelte'

const toasts = $derived(getToasts())

const alertClass = (type: string) => {
	switch (type) {
		case 'success':
			return 'alert-success'
		case 'error':
			return 'alert-error'
		case 'warning':
			return 'alert-warning'
		default:
			return 'alert-info'
	}
}
</script>

<div class="toast toast-end toast-top z-50">
  {#each toasts as toast (toast.id)}
    <div class="alert {alertClass(toast.type)}">
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
