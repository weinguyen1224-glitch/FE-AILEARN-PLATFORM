# QueryBuilder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm QueryBuilder utility vào ant-design-pro để hỗ trợ build query params với type-safe autocomplete theo entity interface.

**Architecture:** Copy file `query-builder.ts` từ seo-side, đặt tại `src/utils/query-builder.ts`. Component dùng `qb<EntityType>()` để build params, sau đó truyền vào hooks hiện có.

**Tech Stack:** TypeScript, React hooks (useRequest từ umi/max)

---

### Task 1: Copy query-builder.ts

**Files:**
- Create: `src/utils/query-builder.ts`

- [ ] **Step 1: Copy query-builder.ts**

Đọc file nguồn:
```bash
cat /home/weinguyen/Desktop/PUPBASE/Base-Frontend/seo-side/src/core/utils/query-builder.ts
```

Tạo file mới tại `src/utils/query-builder.ts` với nội dung giống y hệt.

- [ ] **Step 2: Commit**

```bash
cd /home/weinguyen/Desktop/PUPBASE/Base-Frontend/ant-design-pro
git add src/utils/query-builder.ts
git commit -m "feat: add QueryBuilder utility for type-safe query building"
```

---

### Task 2: Verify exports

**Files:**
- Modify: `src/typings.d.ts` (thêm global type declarations nếu cần)

Kiểm tra xem có cần export gì thêm không:
- [ ] Kiểm tra `qb` function đã export đúng trong file
- [ ] Kiểm tra các types đã export: `QueryBuilder`, `QueryParams`, `SortOrder`, `FilterValue`

---

## Usage Example

```tsx
import { qb } from '@/utils/query-builder';

// Build params với autocomplete theo entity type
const params = qb<API.RuleListItem>()
  .eq('status', 1)
  .like('name', searchText)
  .page(1)
  .size(20)
  .buildQueryParams();

// Truyền vào hook hiện tại
const { data, loading } = useRequest(() => queryFakeList(params));
```