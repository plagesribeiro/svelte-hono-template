<script lang="ts">
import { marked } from 'marked'

type Props = {
	role: 'user' | 'assistant'
	content: string
}
let { role, content }: Props = $props()

marked.setOptions({
	breaks: true,
	gfm: true,
})

const html = $derived(marked.parse(content) as string)
</script>

<div class="chat" class:chat-end={role === 'user'} class:chat-start={role === 'assistant'}>
	<div class="chat-bubble prose prose-sm" class:chat-bubble-primary={role === 'user'}>
		{@html html}
	</div>
</div>

<style>
	.chat-bubble :global(p:first-child) {
		margin-top: 0;
	}
	.chat-bubble :global(p:last-child) {
		margin-bottom: 0;
	}
	.chat-bubble :global(p) {
		margin: 0.25em 0;
	}
	.chat-bubble :global(ul),
	.chat-bubble :global(ol) {
		margin: 0.25em 0;
		padding-left: 1.25em;
	}
	.chat-bubble :global(strong) {
		font-weight: 700;
	}
</style>
