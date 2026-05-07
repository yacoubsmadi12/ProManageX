# ProManageX

Enterprise-grade SaaS workforce and contractor management platform with 13+ modules.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/promanagex run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, Recharts, Wouter, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit Auth (OpenID Connect)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth for all endpoints
- `lib/db/src/schema/` — All Drizzle table definitions
- `lib/db/src/schema/auth.ts` — Users + sessions tables (Replit Auth, FK target for all user refs)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — Generated Zod schemas
- `artifacts/api-server/src/routes/` — All Express route handlers
- `artifacts/promanagex/src/pages/` — All frontend page components
- `artifacts/promanagex/src/components/layout/` — Sidebar + Header + Layout

## Architecture decisions

- Contract-first API: OpenAPI spec drives Orval codegen for both React hooks and Zod validators
- Users table in `auth.ts` uses `varchar` UUID ids (from Replit Auth), not serial integers
- All FK references to users.id must use `varchar` type
- Orval mode "single" generates one file (`generated/api.ts`) — codegen script patches `index.ts` post-generation to remove the stale `./generated/types` export
- Frontend uses shared proxy at path `/` — API calls use `BASE_URL + /api/...` pattern

## Product

ProManageX covers:
1. **Dashboard** — KPI summary cards, attendance trend chart, contractor performance, activity feed
2. **User Management** — Employee directory with roles, departments, status filters
3. **Contractor Management** — Contractor CRUD, blacklist toggle, classification tiers, performance scores
4. **Contract Management** — Contracts with value tracking, payment progress bars, expiry alerts
5. **Attendance & Workforce** — Daily check-in/out records, today's breakdown pie chart, date filtering
6. **Evaluations & KPIs** — Scoring across KPI/attendance/quality/punctuality, rankings leaderboard
7. **Violations & Penalties** — Violation reporting, category breakdowns, penalty tracking
8. **Work Areas** — Project site management with progress tracking and team assignments
9. **Equipment & Inventory** — Equipment lifecycle, maintenance schedules, condition tracking
10. **Notifications** — Real-time notification feed with read/unread state
11. **Reports** — Report template gallery with generate/export actions
12. **Audit Logs** — Full action history with entity tracking and IP logging

## Gotchas

- Run `pnpm --filter @workspace/db run push` after any schema changes
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes
- `lib/db/src/schema/auth.ts` is mandatory for Replit Auth — do not rename or remove `usersTable` or `sessionsTable`
- FK columns referencing `usersTable.id` must use `varchar` (UUID), never `integer`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
