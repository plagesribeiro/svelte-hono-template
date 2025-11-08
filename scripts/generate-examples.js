#!/usr/bin/env node

/**
 * Generate .example files from secret files
 * Replaces all values with "example"
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const files = [
	{
		source: path.join(__dirname, '..', 'apps', 'api', '.dev.vars'),
		target: path.join(__dirname, '..', 'apps', 'api', '.dev.vars.example'),
	},
	{
		source: path.join(__dirname, '..', 'apps', 'web', '.env.local'),
		target: path.join(__dirname, '..', 'apps', 'web', '.env.local.example'),
	},
]

function generateExample(sourceFile, targetFile) {
	try {
		if (!fs.existsSync(sourceFile)) {
			console.log(`⚠️  Skipping ${path.basename(sourceFile)} - file not found`)
			return
		}

		const content = fs.readFileSync(sourceFile, 'utf-8')
		const lines = content.split('\n')

		const exampleLines = lines.map((line) => {
			// Skip empty lines and comments
			if (!line.trim() || line.trim().startsWith('#')) {
				return line
			}

			// Process KEY=VALUE lines
			if (line.includes('=')) {
				const [key] = line.split('=')
				return `${key}=example`
			}

			return line
		})

		fs.writeFileSync(targetFile, exampleLines.join('\n'), 'utf-8')
		console.log(`✅ Generated ${path.relative(process.cwd(), targetFile)}`)
	} catch (error) {
		console.error(`❌ Error processing ${sourceFile}:`, error.message)
	}
}

console.log('🔐 Generating example files from secrets...\n')

files.forEach(({ source, target }) => {
	generateExample(source, target)
})

console.log('\n✨ Done!')
