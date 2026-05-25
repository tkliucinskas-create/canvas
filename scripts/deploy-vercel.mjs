#!/usr/bin/env node
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')

for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  const k = t.slice(0, i).trim()
  let v = t.slice(i + 1).trim()
  process.env[k] = v
}

if (!(process.env.VERCEL_TOKEN || '').trim()) {
  console.error('Trūksta VERCEL_TOKEN .env faile')
  process.exit(1)
}

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env })
}

try {
  run('npx vercel whoami')
} catch {
  console.error('VERCEL_TOKEN neveikia — naudokite: npx vercel login')
  process.exit(1)
}

run('npx vercel link --yes')
run('npx vercel deploy --prod --yes')
