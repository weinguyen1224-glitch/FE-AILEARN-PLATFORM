---
status: ready-for-dev
project_name: 'ant-design-pro'
user_name: 'Weinguyen'
date: '2026-04-09'
intent: 'Build simple admin dashboard for e-commerce with san-pham, danh-muc, don-hang modules'
---

# Spec: E-Commerce Admin Dashboard

## Context

Build a simple admin dashboard for e-commerce website using the modular architecture that was just set up. Verify the architecture works by creating CRUD pages for main entities.

**Entities to implement (from OpenAPI json.json):**
- **san-pham** (products) - name, giaBan, moTa, trangThai, hinhAnh, danhMuc
- **danh-muc** (categories) - ten, moTa, trangThai
- **don-hang** (orders) - ma, ngayDat, trangThai, tongTien, nguoiDung

**API Base URL:** Configured in `src/services/` via `_mock.ts` for development

---

## Implementation Tasks

### Task 1: Generate Modules

Generate module structure for each entity:

```bash
npm run generate:module san-pham
npm run generate:module danh-muc
npm run generate:module don-hang
```

### Task 2: Create Mock API Handlers

**File:** `src/modules/san-pham/_mock.ts` (and similar for other modules)

Create mock data matching the API response types.

### Task 3: Update Types

**File:** `src/modules/san-pham/types/san-pham.types.ts`

```typescript
export interface SanPham extends BaseEntity {
  ten: string;
  giaBan: number;
  moTa?: string;
  trangThai: 'ACTIVE' | 'INACTIVE';
  hinhAnh?: string;
  danhMucId?: number;
}
```

### Task 4: Create List Page

**File:** `src/modules/san-pham/pages/index.tsx`

Features:
- Ant Design Table with pagination
- Search by name
- Filter by status
- Columns: ID, Tên, Giá, Trạng thái, Actions

### Task 5: Create Detail Page

**File:** `src/modules/san-pham/pages/[id].tsx`

Features:
- Form with Ant Design
- Edit/Save functionality
- Back to list button

### Task 6: Add Routes

**File:** `config/routes.ts`

Add routes for each module's list and detail pages.

---

## Acceptance Criteria

### AC1: Module Generation Works
- [ ] `npm run generate:module san-pham` creates proper structure
- [ ] All 3 modules (san-pham, danh-muc, don-hang) are generated

### AC2: Layer Architecture Followed
- [ ] UI components use hooks only (no direct service imports)
- [ ] Hooks use createBaseHooks pattern
- [ ] Services extend BaseService

### AC3: List Pages Work
- [ ] Table displays data with pagination
- [ ] Search and filter functional
- [ ] Proper loading/error states

### AC4: Build Succeeds
- [ ] `npm run build` completes without errors
- [ ] Dev server runs without errors

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `src/modules/san-pham/pages/index.tsx` |
| Create | `src/modules/san-pham/pages/[id].tsx` |
| Create | `src/modules/san-pham/_mock.ts` |
| Create | `src/modules/danh-muc/pages/index.tsx` |
| Create | `src/modules/danh-muc/pages/[id].tsx` |
| Create | `src/modules/danh-muc/_mock.ts` |
| Create | `src/modules/don-hang/pages/index.tsx` |
| Create | `src/modules/don-hang/pages/[id].tsx` |
| Create | `src/modules/don-hang/_mock.ts` |
| Modify | `config/routes.ts` |
