export const Logger = {
    info: (message: string, data?: Record<string, unknown>) => {
        console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }))
    },
    error: (message: string, error?: Error | Record<string, unknown>) => {
        console.error(
            JSON.stringify({
                level: 'error',
                message,
                error:
                    error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
                timestamp: new Date().toISOString(),
            }),
        )
    },
    warn: (message: string, data?: Record<string, unknown>) => {
        console.warn(JSON.stringify({ level: 'warn', message, ...data, timestamp: new Date().toISOString() }))
    },
}