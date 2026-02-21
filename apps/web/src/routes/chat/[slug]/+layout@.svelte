<script lang="ts">
import '../../../app.css'

let { children } = $props()
</script>

<div class="min-h-screen bg-base-200 flex flex-col" data-theme="forest">
	{@render children()}
</div>
