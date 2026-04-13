# Plan: Integrate ant-design-pro Pages into Core Architecture

## Context

- **Project**: ant-design-pro Base Frontend
- **Goal**: Extract patterns from old `src/pages/form/` and `src/pages/list/` (ant-design-pro clone) to enhance `src/common/components/core/`
- **Constraint**: Plan mode only - no code execution yet

---

## Current State Analysis

### New Core Components (`src/common/components/core/`)

| Component | Lines | Pattern |
|-----------|-------|---------|
| `base-form.tsx` | 73 | Simple Form wrapper + submit/cancel |
| `base-table.tsx` | 52 | Card + Table wrapper |
| `base-modal.tsx` | 85 | Confirm modal + sized Modal |

### Old Pages (`src/pages/`)

| Page | Key Patterns |
|------|--------------|
| `form/basic-form` | ProForm, validation, dependencies |
| `form/advanced-form` | FooterToolbar, EditableProTable, multi-section |
| `form/step-form` | Wizard/step pattern |
| `list/basic-list` | useRequest, List CRUD, OperationModal |
| `list/card-list` | Grid layout, Card hover, content/extraContent |
| `list/search/*` | Search + filter patterns, TagSelect |

---

## Proposed Architecture Evolution

### Phase 1: Enhanced BaseForm

**Current**: Simple Form wrapper
**Add**:
- Error display slot (like FooterToolbar in advanced-form)
- ProForm field type wrappers (ProFormText, ProFormSelect patterns)
- Submit state handling (loading indicator)
- Section/form group pattern (BaseFormSection already exists)

**File**: `src/common/components/core/base-form.tsx`

### Phase 2: Enhanced BaseTable

**Current**: Card + Table with basic pagination
**Add**:
- Editable table support (from EditableProTable patterns)
- Row selection callbacks (already exists)
- Toolbar slot for actions
- Empty state handling

**File**: `src/common/components/core/base-table.tsx`

### Phase 3: Hook Utilities

Extract reusable patterns:
- `useCRUDRequest` - wraps useRequest with mutate pattern
- `useTablePagination` - pagination config helper

**New file**: `src/common/hooks/useRequest.ts` (optional)

### Phase 4: BaseModal Enhancements

**Current**: Confirm modal + sized Modal
**Add**:
- Form modal variant (for CRUD operations)
- Loading state on footer buttons

**File**: `src/common/components/core/base-modal.tsx`

### Phase 5: Optional ProComponents Integration

Consider adding `@ant-design/pro-components` support if ProForm patterns are needed in base components.

---

## Implementation Order

1. **BaseForm** - most pattern extraction potential
2. **BaseTable** - table is core to most list pages
3. **Hook utilities** - DRY for data fetching
4. **BaseModal** - form modals common in CRUD

---

## Questions / Clarifications Needed

1. Do you want to **keep** the old pages as reference implementation only, or **migrate** them to use the new base components?
2. Should base components support **ProComponents** (@ant-design/pro-components) or stay with plain **Ant Design**?
3. Is the goal **minimal** changes (just enhance base components) or **full migration** (rewrite old pages)?

---

## Files to Modify

- `src/common/components/core/base-form.tsx`
- `src/common/components/core/base-table.tsx`
- `src/common/components/core/base-modal.tsx`

## Files to Create (optional)

- `src/common/hooks/useRequest.ts`
- `src/common/components/core/base-form-section.tsx` (extract from current, already exists)
