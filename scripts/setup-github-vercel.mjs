#!/usr/bin/env node
/**
 * Reads .env: GITHUB_TOKEN, GITHUB_USER, GITHUB_REPO, VERCEL_TOKEN
 * Creates GitHub repo (if missing), pushes code, links Vercel, deploys.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    process.env[k] = v
  }
}

function req(name) {
  const v = (process.env[name] || '').trim()
  if (!v) throw new Error(`Trūksta ${name} faile cursor-task-canvas/.env`)
  return v
}

function run(cmd, opts = {}) {
  console.log('→', cmd.replace(process.env.GITHUB_TOKEN || '', '***'))
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts })
}

async function githubApi(path, method = 'GET', body) {
  const token = req('GITHUB_TOKEN')
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    if (res.status === 404 && path === '/user/repos') {
      throw new Error(
        `GitHub API 404: token negali kurti repo. Sukurkite rankiniu https://github.com/new (${owner}/${repo}, private), tada: npm run push`,
      )
    }
    throw new Error(`GitHub API ${res.status} ${path}: ${data.message || text}`)
  }
  return data
}

loadEnv(path.join(root, '.env'))

const user = req('GITHUB_USER')
const repo = process.env.GITHUB_REPO?.trim() || 'cursor-task-canvas'
const vercelToken = req('VERCEL_TOKEN')

// Verify GitHub token
const me = await githubApi('/user')
if (me.login !== user) {
  console.warn(`GITHUB_USER=${user}, bet token priklauso: ${me.login} — naudojame ${me.login}`)
}
const owner = me.login

// Create private repo if 404
try {
  await githubApi(`/repos/${owner}/${repo}`)
  console.log(`Repo jau egzistuoja: ${owner}/${repo}`)
} catch (e) {
  if (!String(e.message).includes('404')) throw e
  console.log(`Kuriame privatų repo: ${owner}/${repo}`)
  await githubApi('/user/repos', 'POST', {
    name: repo,
    private: true,
    description: 'Asmeninis Cursor užduočių React Flow žemėlapis',
    auto_init: false,
  })
}

if (!fs.existsSync(path.join(root, '.git'))) {
  run('git init -b main')
}

const remote = `https://${owner}:${req('GITHUB_TOKEN')}@github.com/${owner}/${repo}.git`
run(`git remote remove origin`, { stdio: 'pipe' })
try {
  run(`git remote add origin "${remote.replace(/"/g, '\\"')}"`)
} catch {
  run(`git remote set-url origin "${remote.replace(/"/g, '\\"')}"`)
}

run('git add -A')
try {
  run('git commit -m "Initial personal cursor task canvas"')
} catch {
  console.log('(commit jau buvo arba nieko naujo)')
}
run('git push -u origin main')

process.env.VERCEL_TOKEN = vercelToken
run('npx vercel link --yes --project cursor-task-canvas 2>/dev/null || npx vercel link --yes')
run('npx vercel deploy --prod --yes')

console.log('')
console.log('Baigta.')
console.log(`GitHub: https://github.com/${owner}/${repo}`)
console.log('Vercel: žr. deploy output aukščiau')
