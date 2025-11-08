import { browser } from '$app/environment'

const asyncLocalStoragePromise =
	!browser && import('node:async_hooks').then((m) => new m.AsyncLocalStorage<App.Locals>())

export const isolateLocals = async <T>(locals: App.Locals, fn: () => Promise<T>): Promise<T> => {
	const asyncLocalStorage = await asyncLocalStoragePromise
	if (!asyncLocalStorage) {
		return fn()
	}
	return asyncLocalStorage.run(locals, fn)
}

export const getLocals = async () => {
	const asyncLocalStorage = await asyncLocalStoragePromise
	if (!asyncLocalStorage) {
		throw new Error('AsyncLocalStorage not available')
	}
	return asyncLocalStorage.getStore()
}
