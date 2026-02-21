<script lang="ts">
import { page } from '$app/state'
</script>

<div class="flex-1 flex items-center justify-center p-8">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-error">{page.status}</h1>
    <p class="text-lg mt-2">{page.error?.message ?? 'Erro inesperado'}</p>
    <a href="/dashboard" class="btn btn-primary mt-4">Voltar ao dashboard</a>
  </div>
</div>
