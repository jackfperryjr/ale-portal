# ALE Portal — The Brewery

Next.js admin dashboard for reviewing AI-flagged video content and managing the human notarization queue.

---

## How It Works

Authenticated brewmasters sign in via Google OAuth and land on the Brewery dashboard, which shows two views side by side: items pending human review and the most recent AI scan results. Each queue item can be opened for a full review — including Hive AI signal scores, a notes field, and buttons to mark the content as genuine or synthetic. A public `/scans` feed is available without auth.

**Status lifecycle:** `pending` → `brewing` → `verified` / `rejected`

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

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon recommended)
- A Google OAuth app

### Setup

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Comma-separated list of emails allowed to access The Brewery
BREWERY_ALLOWED_EMAILS=you@example.com

# Set to "true" to skip auth entirely (local dev only)
SKIP_AUTH=false
```

Sync the Prisma schema:

```bash
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

The Brewery will be available at `http://localhost:3000/brewery`.

---

## Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start dev server                   |
| `npm run build`   | Production build                   |
| `npm run start`   | Start production server            |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio               |

---

## Environment Variables

| Variable                 | Required | Description                                         |
|--------------------------|----------|-----------------------------------------------------|
| `DATABASE_URL`           | Yes      | PostgreSQL connection string                        |
| `NEXTAUTH_URL`           | Yes      | Public base URL of the portal                       |
| `NEXTAUTH_SECRET`        | Yes      | Random secret for session signing                   |
| `GOOGLE_CLIENT_ID`       | Yes      | Google OAuth app client ID                          |
| `GOOGLE_CLIENT_SECRET`   | Yes      | Google OAuth app client secret                      |
| `BREWERY_ALLOWED_EMAILS` | Yes      | Comma-separated list of emails permitted to sign in |
| `SKIP_AUTH`              | No       | Set to `true` to bypass auth (development only)     |

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
