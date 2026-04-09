---
project_name: 'seo-side'
user_name: 'Weinguyen'
date: '2026-04-09T00:00:00.000Z'
sections_completed: ['technology_stack', 'critical_anti_patterns', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 45
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Technologies
- **Next.js**: 15.5.9
- **React**: 18.3.1
- **TypeScript**: 5 (strict mode enabled)
- **TanStack React Query**: 5.90.19

### UI & Styling
- **Tailwind CSS**: 4.1.9
- **Radix UI**: Multi-package components (1.x - 2.x range)
- **clsx/tailwind-merge**: 2.1.1 / 3.3.1

### Forms & Validation
- **React Hook Form**: 7.60.0
- **Zod**: 3.25.76
- **@hookform/resolvers**: 3.10.0

### API & Data
- **Axios**: 1.13.2

### Path Aliases (tsconfig.json)
- `@/*` → `./*`
- `@modules/*` → `./src/modules/*`
- `@core/*` → `./src/core/*`
- `@components/*` → `./src/components/*`
- `@client/*` → `./src/client/*`

### TypeScript Configuration
- `strict: true`
- `esModuleInterop: true`
- `moduleResolution: "bundler"`

---

## Critical Implementation Rules

### Layer Architecture (STRICT)

**Allowed Data Flow:**
```
UI → Hooks → Service → API (via BaseApiClient)
```

**Forbidden Flows:**
- UI → Service (MUST use hooks)
- UI → API (MUST use hooks)
- Hooks → API (MUST use service)
- Any reverse or circular dependencies

**Layer Responsibilities:**
- **UI Layer**: JSX rendering, local state, call hooks ONLY
- **Hooks Layer**: React Query, call service ONLY, canonical query keys
- **Service Layer**: Business logic, HTTP via BaseApiClient, typed returns
- **Types Layer**: Interfaces ONLY in `.types.ts` files

---

### Critical Anti-Patterns (MUST AVOID)

#### 1. Layer Violations
```typescript
// ❌ FORBIDDEN - UI importing service
import { sanPhamService } from "../services/san-pham.service";

// ❌ FORBIDDEN - Service importing hooks
import { useGetOneSanPham } from "../hooks/san-pham.hooks";

// ✅ REQUIRED - UI imports hooks only
import { useGetOneSanPham } from "../hooks/san-pham.hooks";
```

#### 2. Query Key Anti-Patterns
```typescript
// ❌ FORBIDDEN - Ad-hoc query keys
useQuery(['custom-key', id], () => api.get(id))

// ❌ FORBIDDEN - Inline keys
useQuery([`${resource}-${id}`], () => api.get(id))

// ✅ REQUIRED - Canonical keys via createBaseHooks
const { useGetOne } = createBaseHooks('san-pham', service);
useGetOne(qb<SanPham>().eq('id', id).buildSerializedQuery());
```

#### 3. QueryBuilder Usage (MANDATORY)
```typescript
// ❌ FORBIDDEN - Manual JSON.stringify
const filter = JSON.stringify({ id: params.id });
const populate = JSON.stringify(['listSku']);

// ❌ FORBIDDEN - Without QueryBuilder
useGetOneSanPham({ filter: { id: params.id }, populate: ['listSku'] });

// ✅ REQUIRED - QueryBuilder for all query parameters
import { qb } from "@/core/utils";
const query = qb<SanPham>()
  .eq('id', params.id)
  .populate('listSku')
  .buildSerializedQuery();
useGetOneSanPham(query);
```

#### 4. Type Definition Rules
```typescript
// ❌ FORBIDDEN - Inline types in components
interface LocalProductData {
  id: number;
  name: string;
}

// ❌ FORBIDDEN - Types in hooks/service files
type SanPhamFilter = { search: string; }; // Must be in .types.ts

// ✅ REQUIRED - Types ONLY in module's .types.ts file
// src/modules/san-pham/types/san-pham.types.ts
export interface SanPham extends BaseEntity { ... }
```

#### 5. Error Handling Anti-Patterns
```typescript
// ❌ FORBIDDEN - Silent error swallowing
try {
  await operation();
} catch {
  // Silent fail
}

// ✅ REQUIRED - Handle or rethrow errors
try {
  await operation();
} catch (error) {
  service.handleError(error, "operation", context);
}
```

#### 6. Forbidden Import Patterns
- UI MUST NOT import service layer
- Hooks MUST NOT import types layer directly (use from service)
- Service MUST NOT import hooks or React Query
- Types MUST NOT contain logic or runtime behavior

---

### Language-Specific Rules

#### TypeScript Configuration
- `strict: true` enforced - no implicit any
- `esModuleInterop: true` for Next.js compatibility
- `moduleResolution: "bundler"` for modern resolution
- `jsx: "preserve"` for Next.js JSX handling

#### Import Conventions
```typescript
// Use type imports for type-only imports
import type { SanPham, CreateSanPhamDto } from '../types';

// Use path aliases consistently
import { qb } from '@/core/utils';
import { createBaseHooks } from '@/core/hooks/base.hooks';
```

#### Error Handling Pattern
- ServiceError class with code, statusCode, context
- Logger interface for dependency injection
- ConsoleLogger as default implementation
- Error transformation in service layer only

---

### Framework-Specific Rules

#### React/Next.js Patterns

**Hooks Factory Pattern:**
```typescript
// All entities use createBaseHooks factory
const {
  useGetPage, useGetMany, useGetOne,
  useCreate, useUpdate, useRemove
} = createBaseHooks<SanPham, CreateSanPhamDto, UpdateSanPhamDto>('san-pham', service);
```

**Component Structure:**
- Use "use client" directive for client components
- Module structure per entity: `components/`, `hooks/`, `services/`, `types/`
- Destructured exports from hooks factory

**State Management:**
- TanStack React Query for server state
- useState/useReducer for local component state
- No Redux/Zustand (React Query + local state only)

**Service Pattern:**
```typescript
// Extend BaseService with proper typing
class SanPhamService extends BaseService<SanPham, CreateSanPhamDto, UpdateSanPhamDto> {
  protected resourcePath = '/san-pham';
}
```

**QueryClient Invalidation:**
```typescript
// In mutation hooks onSuccess callback
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [queryKey] });
}
```

---

### Testing Rules

#### Test Structure
- Unit tests for service layer methods
- Integration tests for hooks + service
- E2E tests for critical user flows

#### Mock Usage
- Mock service layer in hooks tests
- Mock API calls with axios mock adapter
- QueryClientProvider wrapper for React Query tests

#### Coverage Requirements
- Minimum 80% coverage for service methods
- All CRUD operations tested
- Error handling paths tested

#### Test Boundaries
- Unit: Service layer methods
- Integration: Hooks + Service
- E2E: Full user flows

---

### Code Quality & Style Rules

#### Naming Conventions
- Files: kebab-case (`san-pham.service.ts`, `san-pham.hooks.ts`)
- Entities: PascalCase (`SanPham`, `DonHang`)
- Hooks: camelCase with prefix (`useGetOneSanPham`)
- Services: camelCase (`sanPhamService`)

#### File Organization
- `src/modules/{entity}/` structure
- Subfolders: `components/`, `hooks/`, `services/`, `types/`
- Core utilities: `src/core/utils/`, `src/core/hooks/`, `src/core/services/`

#### Code Style
- 2-space indentation
- Trailing commas
- Single quotes for strings
- No semicolons (ESLint handled)

#### Documentation
- JSDoc comments for public methods
- Inline comments for complex logic
- README per module

---

### Development Workflow Rules

#### Git/Repository
- Conventional commits format
- Branch from main/master
- No enforce commit message hook (verify before commit)

#### Module Generation (CRITICAL)
```bash
# MUST use these scripts ONLY
npm run generate:module ModuleName   # Create new module
npm run delete:module ModuleName     # Delete module

# FORBIDDEN - Manual module creation
# Create files manually → VIOLATION of architectural contract
```

#### Development Scripts
```bash
npm run start:dev        # Development (max-old-space-size=512)
npm run start:dev:turbo  # Turbopack mode
npm run build           # Production build
npm run lint             # ESLint check
```

#### Deployment
- Next.js deployment (Vercel or equivalent)
- No CI/CD config in codebase yet

---

### Critical Don't-Miss Rules

#### 1. Module Generation (CRITICAL - NEVER IGNORE)
```bash
# MUST use these scripts ONLY - manual creation is FORBIDDEN
npm run generate:module ModuleName   # Create new module
npm run delete:module ModuleName     # Delete module

# Manual module creation = VIOLATION = BUG
```

#### 2. QueryBuilder is MANDATORY
- All filter/populate/sort MUST use `qb<T>().eq().buildSerializedQuery()`
- FORBIDDEN to use `JSON.stringify()` directly for query params
- Import from `@/core/utils`

#### 3. Type Definition Location (STRICT)
- Types ONLY in `.types.ts` files
- FORBIDDEN: inline types in components/hooks/services
- FORBIDDEN: duplicate type definitions across files

#### 4. Layer Import Rules (STRICT)
- UI → Hooks ONLY (never → Service)
- Hooks → Service ONLY (never → API directly)
- Service → BaseApiClient (via inheritance)

#### 5. AGENTS.md is the Contract
- Read before implementing anything
- Violation = BUG - MUST fix immediately
- This project-context.md supplements AGENTS.md

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-04-09
