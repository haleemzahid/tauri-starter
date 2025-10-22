#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * Slice Generator Script
 *
 * Usage: node scripts/create-slice.js <slice-name> [use-cases...]
 *
 * Examples:
 *   node scripts/create-slice.js users list create update delete
 *   node scripts/create-slice.js products list create update delete view
 *   node scripts/create-slice.js settings manage-theme manage-profile
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments')
  console.log('\nUsage: node scripts/create-slice.js <slice-name> <use-case-1> [use-case-2] ...')
  console.log('\nExamples:')
  console.log('  node scripts/create-slice.js users list create update delete')
  console.log('  node scripts/create-slice.js products list create update delete view')
  process.exit(1)
}

const sliceName = args[0]
const useCases = args.slice(1)

// Convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Convert kebab-case to camelCase
function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

console.log(`\n🚀 Creating vertical slice: ${sliceName}`)
console.log(`📋 Use cases: ${useCases.join(', ')}\n`)

const sliceDir = path.join(__dirname, '..', 'src', 'slices', sliceName)
const sharedDir = path.join(sliceDir, 'shared')

// Create directories
fs.mkdirSync(sharedDir, { recursive: true })
useCases.forEach(useCase => {
  const useCaseDir = path.join(sliceDir, useCase)
  fs.mkdirSync(useCaseDir, { recursive: true })
})

console.log('✅ Created directories')

// Generate shared/types.ts
const typesContent = `export interface ${toPascalCase(sliceName)} {
  id: number
  // Add your properties here
  created_at: string
  updated_at: string
}

export interface Create${toPascalCase(sliceName)}Input {
  // Add your input properties here
}

export interface Update${toPascalCase(sliceName)}Input {
  // Add your update properties here
}
`
fs.writeFileSync(path.join(sharedDir, 'types.ts'), typesContent)

// Generate shared/database.ts
const databaseContent = `import { getDatabase } from '../../../core/database/client'
import type { ${toPascalCase(sliceName)}, Create${toPascalCase(sliceName)}Input, Update${toPascalCase(sliceName)}Input } from './types'

/**
 * Get all ${sliceName}
 */
export async function get${toPascalCase(sliceName)}s() {
  const database = await getDatabase()
  const ${toCamelCase(sliceName)}s = await database.select<${toPascalCase(sliceName)}[]>(
    'SELECT * FROM ${sliceName} ORDER BY created_at DESC'
  )
  return ${toCamelCase(sliceName)}s
}

/**
 * Get ${sliceName} by ID
 */
export async function get${toPascalCase(sliceName)}ById(id: number) {
  const database = await getDatabase()
  const ${toCamelCase(sliceName)}s = await database.select<${toPascalCase(sliceName)}[]>(
    'SELECT * FROM ${sliceName} WHERE id = $1',
    [id]
  )
  return ${toCamelCase(sliceName)}s[0] || null
}

/**
 * Create a new ${sliceName}
 */
export async function create${toPascalCase(sliceName)}(input: Create${toPascalCase(sliceName)}Input) {
  const database = await getDatabase()
  // TODO: Implement your INSERT query
  const result = await database.execute(
    \`INSERT INTO ${sliceName} (...) VALUES (...)\`,
    []
  )
  return result
}

/**
 * Update ${sliceName}
 */
export async function update${toPascalCase(sliceName)}(id: number, input: Update${toPascalCase(sliceName)}Input) {
  const database = await getDatabase()
  // TODO: Implement your UPDATE query
  const result = await database.execute(
    \`UPDATE ${sliceName} SET ... WHERE id = $1\`,
    [id]
  )
  return result
}

/**
 * Delete ${sliceName}
 */
export async function delete${toPascalCase(sliceName)}(id: number) {
  const database = await getDatabase()
  const result = await database.execute('DELETE FROM ${sliceName} WHERE id = $1', [id])
  return result
}
`
fs.writeFileSync(path.join(sharedDir, 'database.ts'), databaseContent)

console.log('✅ Created shared types and database functions')

// Generate hooks for each use case
useCases.forEach(useCase => {
  const useCaseDir = path.join(sliceDir, useCase)
  const hookName = `use${toPascalCase(useCase)}${toPascalCase(sliceName)}`

  let hookContent = ''

  if (useCase === 'list') {
    hookContent = `import { useQuery } from '@tanstack/react-query'
import { get${toPascalCase(sliceName)}s } from '../shared/database'

export function ${hookName}() {
  return useQuery({
    queryKey: ['${sliceName}'],
    queryFn: get${toPascalCase(sliceName)}s,
  })
}
`
  } else if (useCase === 'create') {
    hookContent = `import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create${toPascalCase(sliceName)} } from '../shared/database'

export function ${hookName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: create${toPascalCase(sliceName)},
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['${sliceName}'] })
    },
    onError: (error) => {
      console.error('Error creating ${sliceName}:', error)
    },
  })
}
`
  } else if (useCase === 'update') {
    hookContent = `import { useMutation, useQueryClient } from '@tanstack/react-query'
import { update${toPascalCase(sliceName)} } from '../shared/database'
import type { Update${toPascalCase(sliceName)}Input } from '../shared/types'

export function ${hookName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Update${toPascalCase(sliceName)}Input }) =>
      update${toPascalCase(sliceName)}(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['${sliceName}'] })
    },
    onError: (error) => {
      console.error('Error updating ${sliceName}:', error)
    },
  })
}
`
  } else if (useCase === 'delete') {
    hookContent = `import { useMutation, useQueryClient } from '@tanstack/react-query'
import { delete${toPascalCase(sliceName)} } from '../shared/database'

export function ${hookName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: delete${toPascalCase(sliceName)},
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['${sliceName}'] })
    },
    onError: (error) => {
      console.error('Error deleting ${sliceName}:', error)
    },
  })
}
`
  } else {
    // Generic use case
    hookContent = `import { useMutation, useQueryClient } from '@tanstack/react-query'

export function ${hookName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement your mutation logic
      console.log('${useCase} ${sliceName}:', data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['${sliceName}'] })
    },
    onError: (error) => {
      console.error('Error ${useCase} ${sliceName}:', error)
    },
  })
}
`
  }

  fs.writeFileSync(
    path.join(useCaseDir, `${hookName}.ts`),
    hookContent
  )

  // Create a component file for list use case
  if (useCase === 'list') {
    const componentContent = `import { ${hookName} } from './${hookName}'

export default function ${toPascalCase(useCase)}${toPascalCase(sliceName)}() {
  const { data: ${toCamelCase(sliceName)}s = [], isLoading, error } = ${hookName}()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading ${sliceName}: {error.toString()}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-base-content">${toPascalCase(sliceName)}</h1>
          <p className="text-base-content/70 mt-2">
            Manage your ${sliceName}
          </p>
        </div>
      </div>

      {/* TODO: Add your component content here */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <pre>{JSON.stringify(${toCamelCase(sliceName)}s, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
`
    fs.writeFileSync(
      path.join(useCaseDir, `${toPascalCase(useCase)}${toPascalCase(sliceName)}.tsx`),
      componentContent
    )
  }
})

console.log('✅ Created use case hooks and components')

// Generate index.ts
const indexContent = `// Main component
export { default as List${toPascalCase(sliceName)} } from './list-${sliceName}/List${toPascalCase(sliceName)}'

// Types
export type { ${toPascalCase(sliceName)}, Create${toPascalCase(sliceName)}Input, Update${toPascalCase(sliceName)}Input } from './shared/types'

// Hooks
${useCases.map(useCase =>
  `export { use${toPascalCase(useCase)}${toPascalCase(sliceName)} } from './${useCase}/use${toPascalCase(useCase)}${toPascalCase(sliceName)}'`
).join('\n')}
`
fs.writeFileSync(path.join(sliceDir, 'index.ts'), indexContent)

// Generate config.ts
const configContent = `import { Package } from 'lucide-react'

export const ${toCamelCase(sliceName)}Config = {
  label: '${toPascalCase(sliceName)}',
  path: '/${sliceName}',
  icon: Package, // TODO: Change this icon
}
`
fs.writeFileSync(path.join(sliceDir, 'config.ts'), configContent)

console.log('✅ Created index.ts and config.ts')

// Generate route file
const routePath = path.join(__dirname, '..', 'src', 'routes', `${sliceName}.tsx`)
const routeContent = `import { createFileRoute } from '@tanstack/react-router'
import { List${toPascalCase(sliceName)} } from '../slices/${sliceName}'

export const Route = createFileRoute('/${sliceName}')({
  component: List${toPascalCase(sliceName)},
} as const)
`
fs.writeFileSync(routePath, routeContent)

console.log('✅ Created route file')

console.log(`\n✨ Slice "${sliceName}" created successfully!\n`)
console.log('📝 Next steps:')
console.log(`   1. Add the table schema to src/core/database/client.ts`)
console.log(`   2. Import ${toCamelCase(sliceName)}Config in src/config/nav-items.ts`)
console.log(`   3. Add it to the navItems array`)
console.log(`   4. Implement your components and database queries`)
console.log(`   5. Start building! 🚀\n`)
