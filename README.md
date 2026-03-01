# ResumeDB

ResumeDB is an interactive SQL workbench portfolio for Brian M. Markowitz.
It presents resume content as a queryable database with curated views and a simulated stored procedure.

## Features

- SQL workbench layout with schema browser, editor tabs, and results panel
- Starter queries for a recruiter-friendly walkthrough
- `Simple` and `Pro` mode toggle
- Views:
  - `v_resume_one_page`
  - `v_skills_matrix`
  - `v_impact_highlights`
  - `v_experience_timeline`
- Procedure:
  - `sp_best_work(@theme)` where `theme` is `scale|reliability|governance|cost|ai`
- Query history panel and playful explain plans
- Data catalog search in schema browser

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + custom CSS theme
- Monaco Editor (`@monaco-editor/react`)
- Local JSON dataset (`src/data/resume-db.json`)
- Simulated SQL execution engine (`src/lib/resumedb/executeQuery.ts`)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run test:unit
npm run test:e2e
```

## Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Import this repository in Vercel: [https://github.com/brianmarkowitz/resumedb](https://github.com/brianmarkowitz/resumedb)
2. Keep framework preset as `Next.js`
3. Set production branch to `main`
4. Enable preview deployments for pull requests
5. Deploy

## Privacy

Personal contact fields are intentionally redacted in the shipped dataset (`email_redacted`).
