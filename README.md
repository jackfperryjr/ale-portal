# ALE Portal — The Brewery

Admin dashboard for reviewing AI-flagged video content and managing the human review queue.

<p align="center">
  <img src="https://github.com/jackfperryjr/ale-portal/actions/workflows/deploy.yml/badge.svg" alt="Build Status" height="20">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/NextAuth.js-000000?style=flat-square&logo=nextauthdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
</p>

---

## How It Works

Authenticated brewmasters sign in via Google OAuth and land on the Brewery dashboard, which shows two views side by side: items pending human review and the most recent AI scan results. Each queue item can be opened for a full review — including Hive AI signal scores, a notes field, and buttons to mark the content as genuine or synthetic. A public `/scans` feed is available without auth.

**Status lifecycle:** `pending` → `brewing` → `genuine` / `synthetic`

---

## Project Structure

```
ale-portal/
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts           # NextAuth API handler
│   ├── brewery/               # Authenticated brewmaster dashboard
│   │   ├── page.tsx           # Queue + recent scans
│   │   ├── actions.ts         # Server actions (updateQueueStatus)
│   │   ├── SignOutButton.tsx
│   │   └── review/[id]/
│   │       ├── page.tsx       # Per-item review page
│   │       └── ReviewActions.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── SignInButton.tsx
│   ├── scans/
│   │   └── page.tsx           # Public scan feed
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Redirects based on auth state
├── lib/
│   ├── auth.ts                # NextAuth config, allowed emails
│   └── db.ts                  # Prisma client singleton
├── prisma/
│   └── schema.prisma          # Models: User, Analysis, BrewmasterQueue
├── middleware.ts              # Auth guard for /brewery routes
├── tailwind.config.ts
└── package.json
```

---

## Data Models

### `Analysis`

| Column         | Type     | Description                            |
|----------------|----------|----------------------------------------|
| `id`           | UUID     | Primary key                            |
| `url`          | string   | The scanned URL                        |
| `video_id`     | string?  | Platform-extracted video identifier    |
| `reality_score`| float?   | 0–100 composite score                  |
| `label`        | string?  | Pure ALE / Mixed Pour / Flat / Skunked |
| `raw_result`   | JSON     | Full Hive response                     |
| `session_id`   | string   | Anonymous extension session UUID       |
| `created_at`   | datetime | UTC timestamp                          |

### `BrewmasterQueue`

| Column        | Type     | Description                                          |
|---------------|----------|------------------------------------------------------|
| `id`          | UUID     | Primary key                                          |
| `url`         | string   | The flagged URL                                      |
| `analysis_id` | UUID?    | FK to `Analysis`                                     |
| `status`      | string   | `pending` → `brewing` → `verified` / `rejected`      |
| `notes`       | text?    | Reviewer-written observations                        |
| `session_id`  | string   | Anonymous extension session UUID                     |
| `created_at`  | datetime | UTC timestamp                                        |
| `updated_at`  | datetime | Last status change                                   |

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Framework | Next.js 14, React 18 (App Router)      |
| Auth     | NextAuth v4, Google OAuth               |
| Database | PostgreSQL (Neon), Prisma ORM           |
| Styling  | Tailwind CSS                            |

---

## License

MIT
