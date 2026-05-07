# TGMSIDC Procurement Portal

## Overview

Enterprise-grade procurement management web app for Telangana State Medical Services and Infrastructure Development Corporation (TGMSIDC). Full workflow: Indent → GM Approval → Rate Contract or Tender path → Purchase Order → Delivery → QA Verification → Acceptance Certificate.

pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (at `artifacts/procurement-ui`)
- **API framework**: Express 5 (at `artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM (at `lib/db`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec`)
- **React Query hooks**: at `lib/api-client-react`
- **Build**: esbuild (CJS bundle)

## Key Pages

- `/` — Procurement Dashboard with KPIs, pipeline chart, SLA metrics, activity feed
- `/indents` — Indent list with GM approval/reject actions
- `/indents/:id` — Indent detail, approve/reject workflow
- `/indents/new` — Create new indent
- `/rate-contracts` — Rate contract list/filter
- `/rate-contracts/:id` — RC detail with renew/close actions
- `/rate-contracts/new` — Create new rate contract
- `/purchase-orders` — PO list with status filter
- `/purchase-orders/:id` — PO detail with approve/cancel
- `/purchase-orders/new` — Create new PO
- `/tenders` — Tender list with milestone progress bar
- `/tenders/:id` — Tender detail with milestone tracker
- `/deliveries` — Deliveries & QA list with QR codes, QA score, docs
- `/deliveries/:id` — Delivery detail with QA scoring and acceptance certificate (blocked until QA = 100% + docs uploaded)
- `/vendors` — Vendor directory
- `/institutions` — Medical facility directory
- `/equipment` — Equipment master with category filter
- `/reports` — Procurement analytics reports

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed database with demo data

## Design Notes

- Deep institutional blue sidebar (`hsl(218 42% 14%)`), amber accents for alerts/status
- Government procurement aesthetic, data-dense tables
- All status filters use `value="all"` (never empty string) — Radix UI SelectItem constraint
- QA acceptance blocked server-side and client-side until `qaComplianceScore === 100` AND `documentsUploaded === true`

## Database Schema (lib/db/src/schema)

8 tables: `institutions`, `vendors`, `equipment`, `rateContracts`, `indents`, `tenders`, `purchaseOrders`, `deliveries`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
