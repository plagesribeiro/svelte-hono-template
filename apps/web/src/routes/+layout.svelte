<script lang="ts">
import { ClerkProvider } from 'svelte-clerk'
import '../app.css'
import { shadcn } from '@clerk/themes'

let { children } = $props()
</script>

<ClerkProvider appearance={{ theme: shadcn }}>
  <div class="w-screen h-screen flex flex-col items-center justify-center">
    {@render children()}
  </div>
</ClerkProvider>
