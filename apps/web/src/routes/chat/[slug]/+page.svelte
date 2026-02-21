<script lang="ts">
import { env } from '$env/dynamic/public'
import ChatBubble from '$lib/components/chat/ChatBubble.svelte'
import ChatHeader from '$lib/components/chat/ChatHeader.svelte'
import ChatInput from '$lib/components/chat/ChatInput.svelte'

let { data } = $props()

const API_URL = env.PUBLIC_SERVER_URL || 'http://localhost:8080'

type Message = {
	id: number
	role: 'user' | 'assistant'
	content: string
}

let messages = $state<Message[]>([])
let loading = $state(true)
let sending = $state(false)
let sessionId = $state<string | null>(null)
let tenantInfo = $state<{
	name: string
	businessType: string
	chatWelcomeMessage: string | null
	logoUrl: string | null
} | null>(null)
let error = $state<string | null>(null)
let messageIdCounter = 0
let chatContainer: HTMLDivElement | undefined = $state()

const scrollToBottom = () => {
	if (chatContainer) {
		chatContainer.scrollTop = chatContainer.scrollHeight
	}
}

const init = async () => {
	try {
		// Fetch tenant info
		const infoRes = await fetch(`${API_URL}/public/chat/${data.slug}/info`)
		if (!infoRes.ok) {
			error = 'Empresa nao encontrada'
			loading = false
			return
		}
		tenantInfo = await infoRes.json()

		// Create session
		const sessionRes = await fetch(`${API_URL}/public/chat/${data.slug}/session`, {
			method: 'POST',
		})
		if (!sessionRes.ok) {
			error = 'Erro ao iniciar sessao'
			loading = false
			return
		}
		const sessionData = await sessionRes.json()
		sessionId = sessionData.sessionId

		// Add welcome message
		if (tenantInfo?.chatWelcomeMessage) {
			messages.push({
				id: messageIdCounter++,
				role: 'assistant',
				content: tenantInfo.chatWelcomeMessage,
			})
		}

		loading = false
	} catch {
		error = 'Erro ao conectar com o servidor'
		loading = false
	}
}

const sendMessage = async (text: string) => {
	if (!sessionId || sending || !text.trim()) return

	// Add user message
	messages.push({
		id: messageIdCounter++,
		role: 'user',
		content: text.trim(),
	})

	sending = true
	setTimeout(scrollToBottom, 50)

	try {
		const res = await fetch(`${API_URL}/public/chat/${data.slug}/message`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message: text.trim(), sessionId }),
		})

		if (res.status === 429) {
			messages.push({
				id: messageIdCounter++,
				role: 'assistant',
				content: 'Limite de mensagens atingido. Por favor, aguarde um momento e tente novamente.',
			})
			sending = false
			setTimeout(scrollToBottom, 50)
			return
		}

		if (!res.ok) {
			messages.push({
				id: messageIdCounter++,
				role: 'assistant',
				content: 'Desculpe, ocorreu um erro. Tente novamente.',
			})
			sending = false
			setTimeout(scrollToBottom, 50)
			return
		}

		const responseData = await res.json()
		messages.push({
			id: messageIdCounter++,
			role: 'assistant',
			content: responseData.response,
		})
	} catch {
		messages.push({
			id: messageIdCounter++,
			role: 'assistant',
			content: 'Desculpe, ocorreu um erro de conexao. Tente novamente.',
		})
	} finally {
		sending = false
		setTimeout(scrollToBottom, 50)
	}
}

$effect(() => {
	init()
})
</script>

{#if loading}
	<div class="flex-1 flex items-center justify-center">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if error}
	<div class="flex-1 flex items-center justify-center">
		<div class="text-center">
			<h2 class="text-xl font-bold mb-2">Ops!</h2>
			<p class="text-base-content/60">{error}</p>
		</div>
	</div>
{:else}
	<ChatHeader name={tenantInfo?.name ?? ''} logoUrl={tenantInfo?.logoUrl} />

	<div class="flex-1 overflow-y-auto p-4 space-y-2" bind:this={chatContainer}>
		{#each messages as msg (msg.id)}
			<ChatBubble role={msg.role} content={msg.content} />
		{/each}

		{#if sending}
			<div class="chat chat-start">
				<div class="chat-bubble">
					<span class="loading loading-dots loading-sm"></span>
				</div>
			</div>
		{/if}
	</div>

	<ChatInput onSend={sendMessage} disabled={sending} />
{/if}
