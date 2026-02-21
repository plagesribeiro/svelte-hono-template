<script lang="ts" generics="T">
import type { Snippet } from 'svelte'

type Props = {
	data: T[]
	columns: { key: string; label: string; render?: (item: T) => string }[]
	loading?: boolean
	onrowclick?: (item: T) => void
	actions?: Snippet<[T]>
}
let { data, columns, loading = false, onrowclick, actions }: Props = $props()
</script>

{#if loading}
  <div class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          {#each columns as col}
            <th>{col.label}</th>
          {/each}
          {#if actions}
            <th>Acoes</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each data as item}
          <tr
            class:hover={!!onrowclick}
            class:cursor-pointer={!!onrowclick}
            onclick={() => onrowclick?.(item)}
          >
            {#each columns as col}
              <td>
                {#if col.render}
                  {col.render(item)}
                {:else}
                  {(item as Record<string, unknown>)[col.key] ?? '-'}
                {/if}
              </td>
            {/each}
            {#if actions}
              <td onclick={(e: MouseEvent) => e.stopPropagation()}>
                {@render actions(item)}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
