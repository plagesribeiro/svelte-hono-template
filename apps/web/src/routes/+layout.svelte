<script lang="ts">
import { ClerkProvider } from 'svelte-clerk'
import '../app.css'
import { shadcn } from '@clerk/themes'
import Toast from '$lib/components/ui/Toast.svelte'

let { children } = $props()
</script>

<ClerkProvider appearance={{ theme: shadcn }}>
  {@render children()}
  <Toast />
</ClerkProvider>
