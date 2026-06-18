Peony Flowers Studio — Local setup

Quick start (how to run this project on another laptop)

Prerequisites
- Node.js 18+ and npm
- Git
- A Supabase project (or a Postgres DB) with the same schema (see migrations)

1) Clone repo

```bash
git clone <your-repo-url> peony-studio
cd peony-studio
```

2) Backend

- Copy example env:
```bash
cd backend
copy .env.example .env     # Windows (PowerShell)
# or
cp .env.example .env       # macOS / Linux
```
- Edit `.env` and set `SUPABASE_URL`, `SUPABASE_KEY` (or `SUPABASE_SERVICE_ROLE` for server) and other values.
- Install and run:
```bash
npm install
node server.js
# or during development
npm install
npm run dev   # if you have nodemon configured
```

3) Frontend

- `frontend` folder contains static html/js/css. You can open `frontend/dashboard.html` in a browser or serve via a static server:
```bash
# from project root
npx http-server frontend -p 8080
# then open http://localhost:8080/dashboard.html
```

4) Database / Supabase

- Run migrations present in `backend/migrations/` (execute SQL in Supabase SQL editor).
- Add RLS policy (see `.env.example` notes) or configure service role key.

5) Tests

- Backend test example:
```bash
cd backend
npm run test:waste
```

Security notes
- Never commit service role keys. Use `.env` locally and add `.env` to `.gitignore`.
- Rotate keys if they become public.

If you want, I can also add scripts to automate starting frontend/backend and creating required DB policies.