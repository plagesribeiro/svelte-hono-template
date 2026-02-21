<script lang="ts">
import type { Snippet } from 'svelte'

type Props = {
	open: boolean
	title: string
	children: Snippet
	onclose?: () => void
}
let { open = $bindable(), title, children, onclose }: Props = $props()

const handleClose = () => {
	open = false
	onclose?.()
}
</script>

<dialog class="modal" class:modal-open={open}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">{title}</h3>
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={handleClose}>✕</button>
    <div class="py-4">
      {@render children()}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={handleClose}>close</button>
  </form>
</dialog>
