# API Reference

This file lists the app's server API endpoints and short descriptions.

- `POST /api/auth/login` — authenticate user (login)
- `POST /api/auth/logout` — logout user
- `POST /api/auth/register` — register new user
- `GET /api/user/[userId]` — fetch user details by id (reads `data/users.json`)
- `GET|POST /api/words` — word-related endpoints (see `app/api/words/route.ts`)

Implementation notes

- API routes are implemented as Next.js route handlers under `app/api/*`.
- Dynamic route params in App Router APIs must be awaited before accessing properties — see `app/api/user/[userId]/route.ts` for an example fix.
