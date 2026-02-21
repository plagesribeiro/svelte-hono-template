<script lang="ts">
import { page } from '$app/state'
import Sidebar from '$lib/components/admin/Sidebar.svelte'
import Topbar from '$lib/components/admin/Topbar.svelte'

let { children, data } = $props()

const isOnboarding = $derived(page.url.pathname.startsWith('/onboarding'))
</script>

{#if isOnboarding}
  <div class="min-h-screen bg-base-200">
    {@render children()}
  </div>
{:else}
  <div class="drawer lg:drawer-open">
    <input id="admin-drawer" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content flex flex-col">
      <Topbar orgName={data.organization?.name ?? 'UaiBook'} />
      <main class="flex-1 p-4 lg:p-6">
        {@render children()}
      </main>
    </div>

    <div class="drawer-side z-40">
      <label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <Sidebar
        businessType={data.organization?.businessType}
        currentPath={page.url.pathname}
      />
    </div>
  </div>
{/if}
