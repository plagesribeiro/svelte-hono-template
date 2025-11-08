import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject({
	test: {
		globals: true,
		poolOptions: {
			workers: {
				wrangler: {
					configPath: './wrangler.jsonc',
				},
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/services/**/*.ts'],
			exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
		},
	},
})
