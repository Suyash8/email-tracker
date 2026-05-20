# EXECUTION_LOG.md - Email Tracker System

## Project Overview
- **Project Name**: Full-Fledged Email & Recipient Tracker
- **Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma ORM (SQLite / PostgreSQL for Vercel/Neon/Supabase), Recharts, Lucide Icons, Nodemailer / Resend API.
- **Created**: 2026-07-24

---

## Log Entries

### [2026-07-24T09:58:30+05:30] Project Initialization & Plan Creation
- **Action**: Initialized project repository and structure.
- **Rationale**: Setting up standard workflow guidelines, execution log, and Next.js full-stack Email Tracker application.

### [2026-07-24T10:05:54+05:30] Feature Branch: feature/core-schema-and-setup
- **Branch**: `feature/core-schema-and-setup`
- **Files Created/Modified**:
  - `prisma/schema.prisma`
  - `.env`
  - `src/lib/db.ts`
  - `package.json`
- **Architectural Rationale**:
  - Configured Prisma with `Tracker`, `Recipient`, `OpenLog`, `ClickLog`, and `Settings` models.
  - Multi-recipient model handles recipient-specific token assignment (`token` field on `Recipient`) to guarantee exact individual tracking even when an email is sent to multiple CC/BCC addresses.
  - Initialized SQLite for local dev environment and prepared PostgreSQL compatibility for Vercel/Neon deployment.
- **Verification**: Executed `npx prisma db push` and `npx prisma generate` cleanly.

