---
project_name: "ant-design-pro"
user_name: "Weinguyen"
date: "2026-04-09"
sections_completed:
  ["technology_stack", "layer_architecture", "core_layer", "module_generation"]
existing_patterns_found: 15
status: complete
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Framework

- **UmiJS**: ^4.6.40 (max)
- **React**: ^19.2.4
- **React DOM**: ^19.2.4
- **TypeScript**: ^6.0.2
- **Node.js**: >=20.0.0

### UI & Design

- **Ant Design**: ^6.2.2
- **Ant Design Pro Components**: ^3.1.12-0
- **Ant Design Icons**: ^6.1.0
- **Ant Design Plots**: ^2.6.0
- **antd-style**: ^4.1.0

### Data Visualization

- **@antv/l7**: ^2.22.7
- **@antv/l7-react**: ^2.4.3

### Utilities

- **dayjs**: ^1.11.19
- **numeral**: ^2.0.6
- **clsx**: ^2.1.1

### Testing

- **Jest**: ^30.0.4
- **@testing-library/react**: ^16.3.0
- **@testing-library/dom**: ^10.4.0
- **jest-environment-jsdom**: ^30.0.5

### Linting & Formatting

- **Biome**: ^2.1.1 (primary linter)
- **ESLint**: via @umijs/lint (disabled, using Biome instead)
- **Tailwind CSS**: ^4

### Build Tools

- **@umijs/max**: ^4.6.40
- **@umijs/max-plugin-openapi**: ^2.0.3

---

## Project Architecture

### Layer Architecture (STRICT)

**Allowed Data Flow:**

```
UI → Hooks → Service → API (via @umijs/max request)
```

**Forbidden Flows:**

- UI → Service (MUST use hooks)
- UI → API (MUST use hooks)
- Hooks → API (MUST use service)
- Any reverse or circular dependencies

**Layer Responsibilities:**

- **UI Layer**: JSX rendering, local state, call hooks ONLY
- **Hooks Layer**: useRequest, call service ONLY
- **Service Layer**: Business logic, HTTP via BaseService
- **Core Layer**: BaseService, BaseHooks, QueryBuilder, Types

### Core Layer Structure

```
src/core/
├── types/           # BaseEntity, QueryOptions, response types
├── utils/           # QueryBuilder (qb<T>())
├── service/        # BaseService class
├── hooks/          # createBaseHooks factory
└── api/            # API config (future)
```

### Modular Architecture

```
src/modules/{module-name}/
├── pages/          # Page components (index.tsx)
├── components/     # Module-specific components
├── hooks/          # Custom React hooks (import from core)
├── services/       # Entity service (extends BaseService)
├── types/          # TypeScript definitions
└── api/            # API definitions (optional)
```

### Path Aliases

- `@/*` → `./src/*`
- `@/modules/*` → `./src/modules/*`
- `@/core/*` → `./src/core/*`
- `@/components/*` → `./src/components/*`
- `@@/*` → `./src/.umi/*`

### Page Routing

- Routes defined in `config/routes.ts`
- Components use path alias: `@/modules/{module}/pages/{page}`
- Layout wraps routes from `src/app.tsx`

---

## Critical Implementation Rules

### Layer Import Rules (STRICT)

```typescript
// ❌ FORBIDDEN - UI importing service
import { sanPhamService } from "../services/san-pham.service";

// ❌ FORBIDDEN - UI importing from core service directly
import { BaseService } from "@/core/service/base.service";

// ✅ REQUIRED - UI imports hooks only
import { useGetSanPham, useCreateSanPham } from "../hooks/san-pham.hooks";
```

### QueryBuilder Usage (MANDATORY)

```typescript
// ✅ REQUIRED - Use qb<T>() for all query parameters
import { qb } from "@/core/utils";
const query = qb<SanPham>()
  .eq("id", params.id)
  .populate("listSku")
  .buildSerializedQuery();
```

### Type Definition Rules

```typescript
// ✅ REQUIRED - Types ONLY in module's types file
// src/modules/san-pham/types/san-pham.types.ts
export interface SanPham extends BaseEntity { ... }
```

### Service Pattern

```typescript
// ✅ REQUIRED - Extend BaseService
import { BaseService } from "@/core/service/base.service";

class SanPhamService extends BaseService<
  SanPham,
  CreateSanPhamDto,
  UpdateSanPhamDto
> {
  protected resourcePath = "/san-pham";
}

export const sanPhamService = new SanPhamService();
```

### Hooks Pattern

```typescript
// ✅ REQUIRED - Use createBaseHooks factory
import { createBaseHooks } from "@/core/hooks/base.hooks";

export const {
  useGetPage: useGetSanPhamPage,
  useGetOne: useGetOneSanPham,
  useCreate: useCreateSanPham,
  useUpdate: useUpdateSanPham,
  useRemove: useRemoveSanPham,
} = createBaseHooks("san-pham", sanPhamService);
```

---

## TypeScript Configuration

- **Strict mode**: enabled
- **moduleResolution**: bundler
- **jsx**: react-jsx
- **noImplicitReturns**: true
- **forceConsistentCasingInFileNames**: true

---

## File Naming Conventions

- PascalCase for components: `MyComponent.tsx`
- camelCase for hooks: `useMyHook.ts`
- camelCase for services: `myService.ts`
- kebab-case for pages folder: `my-page/index.tsx`
- Types file: `{name}.types.ts`

---

## Module Generation (CRITICAL)

```bash
# ✅ Use generate:module script
npm run generate:module san-pham

# ❌ FORBIDDEN - Manual module creation
# Create files manually → VIOLATION of architectural contract
```

Generated structure:

```
src/modules/{name}/
├── types/{name}.types.ts
├── service/{name}.service.ts
├── hooks/{name}.hooks.ts
├── components/
├── pages/
└── index.ts
```

---

## Development Commands

| Command                          | Description                |
| -------------------------------- | -------------------------- |
| `npm run dev`                    | Start dev server           |
| `npm run build`                  | Production build           |
| `npm run test`                   | Run Jest tests             |
| `npm run lint`                   | Run Biome + TSC            |
| `npm run biome`                  | Format with Biome          |
| `npm run analyze`                | Build with bundle analysis |
| `npm run generate:module <name>` | Generate new module        |

---

## Notes for AI Agents

1. **Layer Rules**: UI → Hooks → Service ONLY. Never skip layers.
2. **QueryBuilder**: Always use `qb<T>()` for query parameters
3. **Module Generation**: Use `npm run generate:module` script
4. **Path Aliases**: Use `@/core/*`, `@/modules/*`, `@/components/*`
5. **Route Updates**: When adding pages, update `config/routes.ts`
6. **Biome First**: Run `npm run biome -- --write` before committing
