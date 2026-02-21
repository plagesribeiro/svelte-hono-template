<script lang="ts">
import { client, json } from '$lib/api.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let bookings = $state<any[]>([])
let loading = $state(true)
let weekStart = $state(getMonday(new Date()))

function getMonday(d: Date) {
	const date = new Date(d)
	const day = date.getDay()
	const diff = date.getDate() - day + (day === 0 ? -6 : 1)
	date.setDate(diff)
	date.setHours(0, 0, 0, 0)
	return date
}

function getWeekEnd(start: Date) {
	const end = new Date(start)
	end.setDate(end.getDate() + 6)
	return end
}

const weekEnd = $derived(getWeekEnd(weekStart))
const formatDateISO = (d: Date) => d.toISOString().split('T')[0]

const days = $derived(
	Array.from({ length: 7 }, (_, i) => {
		const d = new Date(weekStart)
		d.setDate(d.getDate() + i)
		return d
	})
)

const DAY_NAMES_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
const formatDate = (d: Date) =>
	`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`

const timeSlots = Array.from({ length: 24 }, (_, i) => {
	const hour = 8 + Math.floor(i / 2)
	const minute = i % 2 === 0 ? '00' : '30'
	if (hour >= 20) return null
	return `${hour.toString().padStart(2, '0')}:${minute}`
}).filter(Boolean) as string[]

const getBookingsForDay = (day: Date) => {
	const dayStr = formatDateISO(day)
	return bookings.filter((b) => b.startTime?.startsWith(dayStr))
}

const getBookingStyle = (booking: any) => {
	const start = new Date(booking.startTime)
	const end = new Date(booking.endTime)
	const startMinutes = start.getHours() * 60 + start.getMinutes() - 8 * 60
	const durationMinutes = (end.getTime() - start.getTime()) / 60000
	const top = (startMinutes / 30) * 2.5
	const height = (durationMinutes / 30) * 2.5
	return `top: ${top}rem; height: ${Math.max(height, 1.5)}rem;`
}

const loadBookings = async () => {
	loading = true
	try {
		const res = await client.admin.bookings.$get({
			query: {
				startDate: formatDateISO(weekStart),
				endDate: formatDateISO(weekEnd),
				limit: '100',
				page: '1',
			},
		})
		if (res.ok) {
			const result = await json(res)
			bookings = result.data
		}
	} catch {
		addToast('Erro ao carregar agendamentos', 'error')
	} finally {
		loading = false
	}
}

const prevWeek = () => {
	const d = new Date(weekStart)
	d.setDate(d.getDate() - 7)
	weekStart = d
}

const nextWeek = () => {
	const d = new Date(weekStart)
	d.setDate(d.getDate() + 7)
	weekStart = d
}

const goToday = () => {
	weekStart = getMonday(new Date())
}

$effect(() => {
	weekStart
	loadBookings()
})
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between flex-wrap gap-2">
		<h1 class="text-2xl font-bold">Calendario</h1>
		<div class="flex items-center gap-2">
			<button class="btn btn-sm btn-outline" onclick={prevWeek}>&larr;</button>
			<button class="btn btn-sm" onclick={goToday}>Hoje</button>
			<button class="btn btn-sm btn-outline" onclick={nextWeek}>&rarr;</button>
			<span class="text-sm font-medium ml-2">
				{formatDate(weekStart)} - {formatDate(weekEnd)}
			</span>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<div class="card bg-base-100 shadow">
			<div class="card-body p-2 overflow-x-auto">
				<div class="min-w-[700px]">
					<div class="grid grid-cols-[60px_repeat(7,1fr)] border-b border-base-300">
						<div class="p-2"></div>
						{#each days as day, i}
							<div class="p-2 text-center border-l border-base-300">
								<div class="font-semibold text-sm">{DAY_NAMES_SHORT[i]}</div>
								<div class="text-xs opacity-60">{formatDate(day)}</div>
							</div>
						{/each}
					</div>
					<div class="grid grid-cols-[60px_repeat(7,1fr)]">
						<div>
							{#each timeSlots as time}
								<div class="h-10 flex items-start justify-end pr-2 text-xs opacity-60 -mt-2">
									{time}
								</div>
							{/each}
						</div>
						{#each days as day}
							<div class="border-l border-base-300 relative">
								{#each timeSlots as _, slotIndex}
									<div
										class="h-10 border-b border-base-200"
										class:border-b-base-300={slotIndex % 2 === 1}
									></div>
								{/each}
								{#each getBookingsForDay(day) as booking}
									<a
										href="/bookings/{booking.id}"
										class="absolute left-0.5 right-0.5 rounded px-1 text-xs overflow-hidden bg-primary text-primary-content"
										style={getBookingStyle(booking)}
									>
										<div class="font-semibold truncate">{booking.clientName ?? 'Cliente'}</div>
										<div class="truncate opacity-80">
											{booking.professionalName ?? booking.courtName ?? ''}
										</div>
									</a>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
