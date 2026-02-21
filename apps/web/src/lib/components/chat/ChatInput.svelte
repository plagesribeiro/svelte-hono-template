<script lang="ts">
type Props = {
	onSend: (message: string) => void
	disabled?: boolean
}
let { onSend, disabled = false }: Props = $props()

let inputValue = $state('')

const handleSubmit = () => {
	if (inputValue.trim() && !disabled) {
		onSend(inputValue)
		inputValue = ''
	}
}

const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault()
		handleSubmit()
	}
}
</script>

<div class="bg-base-100 border-t border-base-300 p-4">
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={inputValue}
			onkeydown={handleKeydown}
			placeholder="Digite sua mensagem..."
			class="input input-bordered flex-1"
			{disabled}
		/>
		<button
			class="btn btn-primary"
			onclick={handleSubmit}
			disabled={disabled || !inputValue.trim()}
		>
			Enviar
		</button>
	</div>
</div>
