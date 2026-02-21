<script lang="ts">
import { client, json } from '$lib/api.svelte'
import StatsCard from '$lib/components/ui/StatsCard.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let todayCount = $state(0)
let upcomingCount = $state(0)
let monthCount = $state(0)
let todayBookings = $state<any[]>([])
let loading = $state(true)

const today = new Date().toISOString().split('T')[0]
const weekEnd = (() => {
	const d = new Date()
	d.setDate(d.getDate() + 7)
	return d.toISOString().split('T')[0]
})()
const monthStart = (() => {
	const d = new Date()
	d.setDate(1)
	return d.toISOString().split('T')[0]
})()
const monthEnd = (() => {
	const d = new Date()
	d.setMonth(d.getMonth() + 1, 0)
	return d.toISOString().split('T')[0]
})()

const loadStats = async () => {
	loading = true
	try {
		const [todayRes, upcomingRes, monthRes] = await Promise.all([
			client.admin.bookings.$get({
				query: { startDate: today, endDate: today, limit: '50', page: '1' },
			}),
			client.admin.bookings.$get({
				query: { startDate: today, endDate: weekEnd, limit: '1', page: '1' },
			}),
			client.admin.bookings.$get({
				query: { startDate: monthStart, endDate: monthEnd, limit: '1', page: '1' },
			}),
		])

		if (todayRes.ok) {
			const data = await json(todayRes)
			todayCount = data.total
			todayBookings = data.data
		}
		if (upcomingRes.ok) {
			const data = await json(upcomingRes)
			upcomingCount = data.total
		}
		if (monthRes.ok) {
			const data = await json(monthRes)
			monthCount = data.total
		}
	} catch {
		addToast('Erro ao carregar estatisticas', 'error')
	} finally {
		loading = false
	}
}

$effect(() => {
	loadStats()
})
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">Dashboard</h1>

  {#if loading}
    <div class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <StatsCard title="Agendamentos Hoje" value={todayCount} />
      <StatsCard title="Proximos 7 dias" value={upcomingCount} />
      <StatsCard title="Este mes" value={monthCount} />
    </div>

    {#if todayBookings.length > 0}
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Agendamentos de Hoje</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Cliente</th>
                  <th>Profissional/Quadra</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {#each todayBookings as b}
                  <tr
                    class="hover cursor-pointer"
                    onclick={() => (window.location.href = `/bookings/${b.id}`)}
                  >
                    <td
                      >{new Date(b.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</td
                    >
                    <td>{b.clientName ?? '-'}</td>
                    <td>{b.professionalName ?? b.courtName ?? '-'}</td>
                    <td>
                      <span
                        class="badge badge-sm {b.status === 'confirmed'
                          ? 'badge-primary'
                          : b.status === 'cancelled'
                            ? 'badge-error'
                            : 'badge-success'}"
                      >
                        {b.status === 'confirmed'
                          ? 'Confirmado'
                          : b.status === 'cancelled'
                            ? 'Cancelado'
                            : b.status === 'completed'
                              ? 'Concluido'
                              : 'Nao compareceu'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {:else}
      <div class="card bg-base-100 shadow">
        <div class="card-body text-center py-8">
          <p class="text-base-content/60">Nenhum agendamento para hoje</p>
        </div>
      </div>
    {/if}
  {/if}
</div>
