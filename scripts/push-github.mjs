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
  // .env failas turi prioritetą (ne seni shell kintamieji)
  process.env[k] = v
}

const token = (process.env.GITHUB_TOKEN || '').trim()
const user = (process.env.GITHUB_USER || '').trim()
const repo = (process.env.GITHUB_REPO || 'cursor-task-canvas').trim()

if (!token || !user) {
  console.error('Užpildykite .env: GITHUB_TOKEN ir GITHUB_USER')
  process.exit(1)
}

const check = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
})
if (check.status === 404) {
  console.error(`
Repo https://github.com/${user}/${repo} dar neegzistuoja.

Sukurkite rankiniu GitHub svetainėje:
  1. https://github.com/new
  2. Name: ${repo}
  3. Private
  4. BE README / .gitignore
  5. Create repository

Tada vėl: npm run push
`)
  process.exit(1)
}

const remote = `https://${user}:${token}@github.com/${user}/${repo}.git`

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit' })
}

if (!fs.existsSync(path.join(root, '.git'))) run('git init -b main')
try {
  run('git remote remove origin')
} catch {}
run(`git remote add origin ${JSON.stringify(remote)}`)
run(`git config user.email "${user}@users.noreply.github.com"`)
run(`git config user.name "${user}"`)
run('git add -A')
try {
  run('git commit -m "Deploy personal cursor task canvas"')
} catch {
  console.log('(commit: nieko naujo)')
}
run('git push -u origin main')
console.log(`\nOK: https://github.com/${user}/${repo}`)
