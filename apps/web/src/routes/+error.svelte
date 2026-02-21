<script lang="ts">
import { page } from '$app/state'
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-error">{page.status}</h1>
    <p class="text-xl mt-4">{page.error?.message ?? 'Algo deu errado'}</p>
    <a href="/" class="btn btn-primary mt-6">Voltar ao inicio</a>
  </div>
</div>
