type Toast = {
	id: number
	message: string
	type: 'success' | 'error' | 'info' | 'warning'
}

let toasts = $state<Toast[]>([])
let nextId = 0

export function addToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
	const id = nextId++
	toasts.push({ id, message, type })
	setTimeout(() => {
		toasts = toasts.filter((t) => t.id !== id)
	}, duration)
}

export function getToasts() {
	return toasts
}
