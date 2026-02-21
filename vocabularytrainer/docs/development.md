# Development Guide

Local development

1. Install dependencies:

```bash
npm install
```

2. Start dev server (hot reload):

```bash
cd vocabularytrainer
npm run dev
# then open http://localhost:3000
```

Linting

```bash
npm run lint
```

Build / Production

```bash
npm run build
npm start
```

Environment variables

- Use `.env.local` for local development secrets (not committed).

Troubleshooting

- If you see PowerShell script execution policy errors on Windows when running npm scripts from PowerShell, either run from `cmd` or adjust execution policy with Administrator privileges:

```powershell
Set-ExecutionPolicy RemoteSigned
```

- If you encounter Next.js App Router dynamic API errors about `params`, make sure to `await params` before using properties in route handlers.
