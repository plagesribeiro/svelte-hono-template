<script lang="ts">
import { OrganizationSwitcher, UserButton } from 'svelte-clerk'
import ThemeSwitcher from '$lib/components/ui/ThemeSwitcher.svelte'

type Props = {
	orgName: string
}
let { orgName }: Props = $props()
</script>

<div class="navbar bg-base-100 border-b border-base-300 px-4">
  <div class="flex-none lg:hidden">
    <label for="admin-drawer" class="btn btn-square btn-ghost drawer-button">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </label>
  </div>

  <div class="flex-1">
    <span class="text-lg font-semibold">{orgName}</span>
  </div>

  <div class="flex items-center gap-2">
    <ThemeSwitcher />
    <OrganizationSwitcher />
    <UserButton />
  </div>
</div>
