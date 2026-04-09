---
status: ready-for-dev
project_name: 'ant-design-pro'
user_name: 'Weinguyen'
date: '2026-04-09'
intent: 'Sync modular architecture and patterns from seo-side to ant-design-pro'
---

# Spec: Sync Modular Architecture from seo-side

## Context

**Goal:** Đồng bộ cấu trúc modular architecture + patterns từ seo-side (Next.js) vào ant-design-pro (UmiJS)

**Yêu cầu:**
1. Sync cấu trúc thư mục (modules/core/utils)
2. Sync architecture patterns (layer rules - UI→Hooks→Service)
3. Giữ UmiJS patterns (useRequest thay vì React Query)
4. Sync module generation scripts

---

## Implementation Tasks

### Task 1: Create Core Layer Structure

**File:** N/A (folder creation)

```
src/core/
├── api/              # BaseApiClient (adapt for UmiJS request)
├── components/       # BaseEmptyState, BaseLoading, BaseModal, etc.
├── config/           # API config
├── constant/         # Constants
├── hooks/           # base.hooks (adapted for UmiJS useRequest)
├── service/         # base.service (adapted for UmiJS request)
├── types/           # base.types
└── utils/           # query-builder, validators
```

### Task 2: Create QueryBuilder Utility

**File:** `src/core/utils/query-builder.ts`

Sync from seo-side with adaptations:
- Keep QueryBuilder class and qb() helper
- Adapt for UmiJS API response patterns

### Task 3: Create BaseService

**File:** `src/core/service/base.service.ts`

Adapt from seo-side:
- Extend UmiJS `request` from @umijs/max
- Keep ServiceError class, ILogger interface
- Keep CRUD methods (create, getPage, getOne, update, remove, etc.)

### Task 4: Create BaseHooks (UmiJS version)

**File:** `src/core/hooks/base.hooks.ts`

Adapt for UmiJS useRequest:
- Keep createBaseHooks factory pattern
- Replace TanStack Query with useRequest from @umijs/max
- Keep same hook names and signatures

### Task 5: Create Base Types

**File:** `src/core/types/base.types.ts`

Sync:
- BaseEntity interface
- QueryOptions interface  
- PageableResponse, AffectedResponse types

### Task 6: Create Module Generation Script

**File:** `scripts/generate-module.js`

Sync from seo-side with UmiJS adaptations:
- Generate types, service, hooks for modules
- Use UmiJS path aliases
- Generate page component template

### Task 7: Update tsconfig.json

**File:** `tsconfig.json`

Add additional path aliases:
- `@/core/*` → `./src/core/*`
- `@/components/*` → `./src/components/*`

### Task 8: Update project-context.md

**File:** `_bmad-output/project-context.md`

Add:
- Core layer structure documentation
- Layer rules (UI→Hooks→Service)
- Module generation instructions
- QueryBuilder usage patterns

---

## Acceptance Criteria

### AC1: Core Layer Exists
- [ ] `src/core/` directory with api, components, hooks, service, types, utils subdirectories
- [ ] BaseService class extends UmiJS request
- [ ] BaseHooks factory using useRequest

### AC2: QueryBuilder Works
- [ ] `qb<T>().eq().buildSerializedQuery()` returns proper query string
- [ ] Supports filter, sort, populate, pagination

### AC3: Module Generation Script Works
- [ ] `npm run generate:module san-pham` creates module structure
- [ ] Generated files: types, service, hooks, pages

### AC4: Layer Rules Enforced
- [ ] Components only import from hooks
- [ ] Hooks only import from services
- [ ] Services use BaseService pattern

### AC5: project-context.md Updated
- [ ] Documents core layer structure
- [ ] Documents layer import rules
- [ ] Documents module generation usage

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/core/types/base.types.ts` |
| Create | `src/core/utils/query-builder.ts` |
| Create | `src/core/service/base.service.ts` |
| Create | `src/core/hooks/base.hooks.ts` |
| Create | `scripts/generate-module.js` |
| Modify | `tsconfig.json` (add path aliases) |
| Modify | `package.json` (add generate:module script) |
| Modify | `_bmad-output/project-context.md` |
