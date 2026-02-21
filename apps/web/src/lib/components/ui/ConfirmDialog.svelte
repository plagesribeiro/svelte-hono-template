<script lang="ts">
import Modal from './Modal.svelte'

type Props = {
	open: boolean
	title: string
	message: string
	confirmLabel?: string
	cancelLabel?: string
	onconfirm: () => void
	oncancel?: () => void
}
let {
	open = $bindable(),
	title,
	message,
	confirmLabel = 'Confirmar',
	cancelLabel = 'Cancelar',
	onconfirm,
	oncancel,
}: Props = $props()
</script>

<Modal bind:open {title}>
  <p>{message}</p>
  <div class="modal-action">
    <button
      class="btn"
      onclick={() => {
        open = false
        oncancel?.()
      }}>{cancelLabel}</button
    >
    <button
      class="btn btn-error"
      onclick={() => {
        open = false
        onconfirm()
      }}>{confirmLabel}</button
    >
  </div>
</Modal>
