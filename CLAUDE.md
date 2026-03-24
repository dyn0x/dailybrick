# DailyBrick Agent Guide

## Project Summary
- Stack: Next.js 16 + React 19 + TypeScript + Tailwind.
- Host target: Vercel.
- Auth and data backend: Supabase.
- App behavior: daily tasks, auto carry-forward for unfinished tasks, 2-member teams, topic progress tracking, reminder toasts, route-based dashboard pages.

## Core Files
- App shell/state orchestration: components/app-shell.tsx
- Route entry pages: app/page.tsx, app/team/page.tsx, app/progress/page.tsx, app/settings/page.tsx
- Layout and navigation components: components/layout.tsx
- Settings UI/actions: components/settings-page.tsx
- Supabase API layer: lib/dailybrick-api.ts
- Supabase client setup: lib/supabase.ts
- Shared UI/domain types: lib/types.ts
- Database schema and RLS policies: supabase/schema.sql
- Global styling and transitions: app/globals.css

## Data Rules To Preserve
- Tasks can be created, toggled, and deleted only by the owner.
- Team size is strictly max 2 members.
- Team members can view each other tasks and progress, but cannot mutate each other tasks.
- Team code must be unique and 10 characters (alphanumeric).
- Pending tasks from previous dates are moved to today automatically for that same owner.

## Route and Navigation Rules
- Pages are route-driven, not tab-state driven:
	- `/` -> Dashboard
	- `/team` -> Team
	- `/progress` -> Progress
	- `/settings` -> Settings
- Desktop left sidebar should not show a Settings menu item.
- Clicking the user profile row in the left sidebar opens `/settings`.
- Clicking the topbar avatar opens `/settings`.
- Bottom nav can include Settings.

## Team Flow
1. User signs up/signs in with Supabase email/password auth.
2. User creates a team (if none exists).
3. Team owner invites one member by email.
4. Invited user signs in with the same email and is auto-linked to the team.

## Settings Page Behavior
- Editable profile name should persist via Supabase (profiles + auth metadata update).
- Push notification toggle is UI preference feedback for now.
- Clear all tasks only removes tasks owned by current user.
- Reset password sends Supabase recovery email.
- Requests section opens GitHub issues: https://github.com/dyn0x/dailybrick/issues
- Help action opens LinkedIn: https://www.linkedin.com/in/manasdutta04
- Keep credit text: "Developed by Manas".

## Loading and Motion UX
- Keep smooth page transitions between route changes.
- Keep skeleton loading visuals for all main pages (dashboard/team/progress/settings).
- Skeleton style should be premium glassy, not solid green.
- Scrollbars should use the premium glass style defined in global CSS.

## Commands
- Install: npm install
- Dev server: npm run dev
- Lint: npm run lint
- Build: npm run build

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Setup Notes
1. Create Supabase project.
2. Run SQL from supabase/schema.sql in Supabase SQL editor.
3. Copy .env.example to .env.local and fill values.
4. Start app with npm run dev.

## Implementation Notes For Agents
- Prefer minimal, targeted edits that preserve existing visual language unless user asks for redesign.
- Prefer edits in lib/dailybrick-api.ts for business logic changes.
- Keep authorization enforcement in RLS, not just frontend checks.
- For reminders, keep polling best-effort and non-blocking.
- Avoid adding server-side secrets to client code.
- After UI behavior changes, validate with `npm run build`.
