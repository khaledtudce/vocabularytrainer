# Architecture

This project is a small Next.js application using the App Router (`app/`) and server
components where appropriate.

Key points:

- Framework: Next.js 15 (App Router)
- Rendering: mix of server and client components; pages live in `app/`
- API routes: colocated under `app/api/` and implemented as route handlers
- Data: simple local JSON files in `data/` (e.g. `users.json`, `wordlists.js`)
- Build: Next.js generates `build/` and `.next/` artifacts; these are safe to remove and are ignored by Git

Routing & API

- UI routes are under `app/(routes)/...` and other top-level `app/` pages.
- API routes are under `app/api/` (for example `app/api/user/[userId]/route.ts`).

Notes

- Keep environment secrets out of repo (`.env*` entries are in `.gitignore`).
- For larger datasets, migrate `data/` to a database or storage instead of committing large JSON.
