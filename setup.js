#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * Setup script for Tauri Starter Template
 * Run this after cloning the template to set up your development environment
 */

import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve))

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
}

async function main() {
  console.clear()
  log.title('🚀 Tauri Starter Template Setup')

  // Step 1: Copy environment files
  log.info('Setting up environment variables...')

  const envFiles = [
    { src: '.env.example', dest: '.env', name: 'Frontend .env' },
    {
      src: 'src-tauri/.env.example',
      dest: 'src-tauri/.env',
      name: 'Backend .env',
    },
  ]

  for (const { src, dest, name } of envFiles) {
    const srcPath = resolve(__dirname, src)
    const destPath = resolve(__dirname, dest)

    if (existsSync(destPath)) {
      log.warning(`${name} already exists, skipping...`)
    } else if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath)
      log.success(`Created ${name}`)
    } else {
      log.error(`${src} not found!`)
    }
  }

  // Step 2: Detect package manager
  log.info('\nDetecting package manager...')

  let packageManager = 'npm'
  if (existsSync(resolve(__dirname, 'bun.lock'))) {
    packageManager = 'bun'
  } else if (existsSync(resolve(__dirname, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm'
  } else if (existsSync(resolve(__dirname, 'yarn.lock'))) {
    packageManager = 'yarn'
  }

  log.success(`Detected: ${packageManager}`)

  // Step 3: Ask to install dependencies
  const shouldInstall = await question(
    `\n${colors.cyan}?${colors.reset} Install dependencies with ${packageManager}? (y/n): `
  )

  if (shouldInstall.toLowerCase() === 'y' || shouldInstall.toLowerCase() === 'yes') {
    log.info(`\nInstalling dependencies with ${packageManager}...`)
    try {
      execSync(`${packageManager} install`, { stdio: 'inherit' })
      log.success('Dependencies installed successfully!')
    } catch (error) {
      log.error('Failed to install dependencies')
      log.error(error.message)
      process.exit(1)
    }
  } else {
    log.warning('Skipping dependency installation')
    log.info(`Run "${packageManager} install" manually when ready`)
  }

  // Step 4: Optional - Update project name
  const shouldRename = await question(
    `\n${colors.cyan}?${colors.reset} Would you like to rename the project? (y/n): `
  )

  if (shouldRename.toLowerCase() === 'y' || shouldRename.toLowerCase() === 'yes') {
    const newName = await question(
      `${colors.cyan}?${colors.reset} Enter new project name: `
    )

    if (newName && newName.trim()) {
      try {
        // Update package.json
        const packageJsonPath = resolve(__dirname, 'package.json')
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        packageJson.name = newName.trim().toLowerCase().replace(/\s+/g, '-')
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
        log.success('Updated package.json')

        // Update Cargo.toml
        const cargoTomlPath = resolve(__dirname, 'src-tauri/Cargo.toml')
        if (existsSync(cargoTomlPath)) {
          let cargoToml = readFileSync(cargoTomlPath, 'utf-8')
          cargoToml = cargoToml.replace(
            /name = "tauri-starter"/,
            `name = "${newName.trim().toLowerCase().replace(/\s+/g, '-')}"`
          )
          writeFileSync(cargoTomlPath, cargoToml)
          log.success('Updated Cargo.toml')
        }

        // Update tauri.conf.json
        const tauriConfPath = resolve(__dirname, 'src-tauri/tauri.conf.json')
        if (existsSync(tauriConfPath)) {
          const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf-8'))
          if (tauriConf.productName) {
            tauriConf.productName = newName.trim()
          }
          if (tauriConf.identifier) {
            const domain = tauriConf.identifier.split('.').slice(0, -1).join('.')
            tauriConf.identifier = `${domain}.${newName.trim().toLowerCase().replace(/\s+/g, '-')}`
          }
          writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2))
          log.success('Updated tauri.conf.json')
        }

        log.success(`Project renamed to: ${newName}`)
      } catch (error) {
        log.error('Failed to rename project')
        log.error(error.message)
      }
    }
  }

  // Step 5: Final instructions
  log.title('✨ Setup Complete!')

  console.log(`${colors.bright}Next steps:${colors.reset}\n`)
  console.log(`  1. Review and customize your ${colors.cyan}.env${colors.reset} files`)
  console.log(
    `  2. Start development: ${colors.cyan}${packageManager} ${packageManager === 'npm' ? 'run ' : ''}tauri dev${colors.reset}`
  )
  console.log(
    `  3. Read ${colors.cyan}SETUP.md${colors.reset} and ${colors.cyan}ARCHITECTURE.md${colors.reset} for more info\n`
  )

  console.log(`${colors.bright}Useful commands:${colors.reset}\n`)
  console.log(
    `  ${colors.cyan}${packageManager} ${packageManager === 'npm' ? 'run ' : ''}tauri dev${colors.reset}      - Start development`
  )
  console.log(
    `  ${colors.cyan}${packageManager} ${packageManager === 'npm' ? 'run ' : ''}tauri build${colors.reset}    - Build for production`
  )
  console.log(
    `  ${colors.cyan}${packageManager} ${packageManager === 'npm' ? 'run ' : ''}lint${colors.reset}           - Check code quality`
  )
  console.log(
    `  ${colors.cyan}${packageManager} ${packageManager === 'npm' ? 'run ' : ''}format${colors.reset}         - Format code\n`
  )

  console.log(
    `${colors.bright}Need help?${colors.reset} Check out the ${colors.cyan}README.md${colors.reset}\n`
  )

  rl.close()
}

main().catch((error) => {
  log.error('Setup failed!')
  console.error(error)
  process.exit(1)
})
