# Job Dashboard

A clean, minimal dashboard to monitor and manage background jobs in real time. Built with React, TypeScript, and Tailwind CSS.

![Job Dashboard](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## What it does

- Shows live stats (pending, processing, completed, failed jobs) — auto-refreshes every 5 seconds
- Lists all jobs in a table with status badges and timestamps
- Filter jobs by status with one click
- Retry any failed job directly from the UI
- Talks to a REST API backend running on `localhost:3000`

## Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **Vite** for dev server and bundling
- Vite proxy to handle CORS in development

## Project Structure

```
src/
├── app/
│   └── page.tsx          # Main page — puts everything together
├── components/
│   ├── StatsCards.tsx    # The 4 stat cards at the top (auto-polls every 5s)
│   ├── FilterBar.tsx     # Filter pills to switch between job statuses
│   └── JobTable.tsx      # Job list with badges, timestamps, and retry button
└── lib/
    └── api.ts            # All API calls in one place
```

## Getting Started

**1. Clone the repo**

```bash
git clone https://github.com/your-username/job-dashboard.git
cd job-dashboard
```

**2. Install dependencies**

```bash
npm install
```

**3. Make sure your backend is running on `http://localhost:3000`**

The frontend expects these endpoints:

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/jobs` | List jobs (supports `?status=`, `?type=`, `?limit=`, `?offset=`) |
| GET | `/api/jobs/stats` | Get counts by status |
| POST | `/api/jobs/:id/retry` | Retry a failed job |
| GET | `/health` | Health check |

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and you're good to go.

## Environment Variables

If your backend runs on a different URL, create a `.env` file:

```env
VITE_API_URL=http://your-backend-url.com
```

By default it proxies through Vite to `localhost:3000`, so you don't need this for local development.

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy it anywhere — Vercel, Netlify, or any static host.

## Why I built this

I wanted a practical project that covers real frontend patterns — polling for live data, handling loading/error states, filtering, and wiring up a REST API cleanly. No unnecessary libraries, just the core stack.
