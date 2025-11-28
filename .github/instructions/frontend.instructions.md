---
applyTo: "frontend/**/*.ts,frontend/**/*.tsx"
---

# Frontend Development Instructions

## Stack
- React 19 + TypeScript + Vite
- TailwindCSS v4 + Radix UI components (shadcn/ui)
- ECharts for charts (via echarts-for-react)
- Zustand for state management
- React Router v7 for routing
- Tanstack Table for data tables

## Component Structure
- `components/ui/` — shadcn/ui components (Button, Dialog, Select, etc.)
- `components/shared/` — reusable app components
- `components/performance/` — Performance page components (charts, selectors)
- `components/pv-diagrams/` — PV Diagrams page components
- `components/layout/` — Layout components (Header, Sidebar)
- `components/metadata/` — Metadata editing dialogs

## Patterns
- Custom hooks in `hooks/` for data fetching and logic
- Zustand stores in `stores/` for global state
- API calls isolated in `api/client.ts`
- Form handling with react-hook-form + zod validation

## TypeScript
- Strict mode enabled
- Use interfaces from `types/` directory
- Shared types from root `shared-types.ts`

## Styling
- TailwindCSS v4 (new syntax)
- Use `cn()` utility for conditional classes (from `lib/utils.ts`)
- Component variants with class-variance-authority (cva)

## ECharts
- Use `echarts-for-react` wrapper
- Chart options in separate helper files
- Support for PNG/SVG export

## Testing & Verification
- Run `npm run typecheck` before committing
- Run `npm run build` to verify production build
- Run `npm run lint` for ESLint checks

## Common Imports
```typescript
// UI components
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// Hooks
import { useProjects } from '@/hooks/useProjects'

// Utils
import { cn } from '@/lib/utils'
```
