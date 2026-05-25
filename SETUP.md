# Greitas setup: GitHub + Vercel

## 1. Užpildykite `.env` (failas atidarytas IDE)

```env
GITHUB_TOKEN=ghp_…          # GitHub → Settings → Developer settings → Tokens (classic) → repo
GITHUB_USER=jūsų-github-vardas
GITHUB_REPO=cursor-task-canvas

VERCEL_TOKEN=…              # Asmeninis Vercel → Account → Tokens
```

**Išsaugokite** (`Cmd+S`).

## 2. Vienas paleidimas

```bash
cd cursor-task-canvas
npm run setup
```

Skriptas:
- sukuria privatų GitHub repo (jei nėra)
- `git push`
- `vercel link` + `vercel deploy --prod`

## 3. Vercel dashboard (jei CLI token neveikia)

1. Asmeninis Vercel → **Add Project** → Import `cursor-task-canvas`
2. **Settings → Git** — prijunkite GitHub OAuth (asmeninis account)
3. **Deployment Protection** — slaptažodis / email

`GITHUB_TOKEN` .env reikalingas **git push** ir `npm run setup` — ne Vercel svetainės importui (ten OAuth).
