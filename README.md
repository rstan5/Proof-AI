# Proof AI

**Verify competency before you hire.**

Proof AI is a simulation-based hiring platform that helps recruiters validate candidate competency through realistic, AI-generated job simulations — before expensive interview loops begin.

> **Status:** Work in progress (MVP). Core flows are being built; not production-ready.

---

## Problem

Bad hires cost companies recruiting hours, onboarding time, training, lost productivity, and often six figures per mis-hire. Proof AI targets the earliest leak in the funnel: **objective pre-screening** through role-specific work simulations instead of resume-only filtering.

## Solution

1. Recruiter defines the role and what they’re looking for  
2. AI generates a realistic simulation brief  
3. Candidate completes the task in a focused writing environment  
4. AI evaluates the response and returns structured competency signal  

Proof AI is **not** an ATS replacement — it’s a focused layer that adds competency verification upstream of interviews.

---

## Features (current)

- **Marketing landing page** — value prop, how it works, ROI framing, animated stats marquee, sample candidate report
- **Recruiter auth** — Supabase magic-link sign-in (company email)
- **Recruiter dashboard** — create custom simulations from company name, role, job description, and competencies
- **Simulation generation** — OpenAI-powered scenario creation, persisted to Supabase
- **Candidate simulation page** — shareable `/sim/[id]` link for candidates to complete work
- **Evaluation API scaffold** — structured JSON rubric for competency scoring (in progress)

## Roadmap

- [ ] Full AI evaluation UI with score breakdown and recommendations
- [ ] Results dashboard for recruiters
- [ ] Row-level security policies in Supabase
- [ ] Vercel deployment + production env config

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & auth | [Supabase](https://supabase.com/) |
| AI | [OpenAI API](https://openai.com/) |
| Deployment (planned) | Vercel |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- A Supabase project
- An OpenAI API key

### 1. Clone and install

```bash
git clone https://github.com/rstan5/proof-ai.git
cd proof-ai
npm install
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `OPENAI_API_KEY` | OpenAI API key (server only) |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000` locally) |

**Never commit `.env.local`.**

### 3. Database

Run the SQL migrations in your Supabase SQL editor (in order):

- `supabase/migrations/001_initial.sql`
- `supabase/migrations/002_expand_simulations.sql`

### 4. Run locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows, if PowerShell blocks scripts:

```powershell
npm.cmd run dev
```

---

## Project structure

```
src/
├── app/              # Next.js routes (landing, dashboard, sim, API)
├── components/       # UI, marketing sections, branding
├── lib/              # Supabase & OpenAI clients, prompts
├── types/            # Shared TypeScript interfaces
└── utils/            # Helpers (e.g. cn)
supabase/migrations/  # Postgres schema
public/               # Static assets (logo, etc.)
```

---

## Author

**Ryan Stan** — [github.com/rstan5](https://github.com/rstan5)

Built as an MVP startup concept exploring AI-assisted hiring pre-screening.

---

## License

Private / all rights reserved (for now). Contact for use or collaboration.
