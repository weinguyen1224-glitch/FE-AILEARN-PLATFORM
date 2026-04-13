# UX Pattern Library

## Giới thiệu

Bộ thư viện UX patterns được xây dựng để đảm bảo consistency trong việc tái sử dụng components và giúp developers nhanh chóng implement các use cases phổ biến.

## Cấu trúc

```
src/common/components/
├── core/                    # Base components (infrastructure)
│   ├── base-table.tsx
│   ├── base-form.tsx
│   └── base-modal.tsx
└── patterns/               # UX Patterns (composition layer)
    ├── list-patterns.tsx   # List patterns
    └── form-patterns.tsx   # Form patterns
```

## Base Components

### BaseTable

Component table cơ bản với các sub-components:

```tsx
import BaseTable from '@/common/components/core/base-table';

// Basic usage
<BaseTable
  headerTitle={<Button type="primary">Thêm mới</Button>}
  loading={loading}
  dataSource={data}
  columns={columns}
  rowKey="id"
  pagination={pagination}
/>

// Compound components
BaseTable.Column    // Column definition
BaseTable.Actions   // Actions column
```

### BaseForm

Component form cơ bản với các sub-components:

```tsx
import BaseForm from '@/common/components/core/base-form';

// Basic usage
<BaseForm
  onFinish={handleFinish}
  isSubmitting={loading}
  submitText="Lưu"
  cancelText="Hủy"
>
  <Form.Item label="Tên" name="name">
    <Input />
  </Form.Item>
</BaseForm>

// Compound components
BaseForm.Section    // Form section với title
BaseForm.Item       // Pre-configured form items (text, textarea, number, select, date, datetime)
BaseForm.Grid       // Grid layout cho form fields
BaseForm.Layout     // Inline layout
```

### BaseModal

Component modal với các sub-components:

```tsx
import BaseModal from '@/common/components/core/base-modal';

// Confirmation modal
<BaseModal.Confirm
  open={open}
  title="Xác nhận xóa"
  content="Bạn có chắc chắn?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  icon="danger"
/>

// Form modal
<BaseModal.Form
  open={open}
  title="Form"
  loading={loading}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
>
  {children}
</BaseModal.Form>

// Compound components
BaseModal.Header    // Modal header với title, subtitle, extra
BaseModal.Footer    // Modal footer với alignment options
BaseModal.Body      // Modal body
```

## UX Patterns

### List Patterns

#### createBaseListPattern

Tạo một list pattern với CRUD operations:

```tsx
import { createBaseListPattern } from '@/common/components/patterns';

const ProductList = createBaseListPattern<Product>();

// Usage trong component
<ProductList
  dataSource={products}
  loading={loading}
  pagination={pagination}
  columns={columns}
  onCreate={handleCreate}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### createSearchListPattern

Tạo một list pattern với search functionality:

```tsx
import { createSearchListPattern } from '@/common/components/patterns';

const ProductSearchList = createSearchListPattern<Product>();
```

### Form Patterns

#### SingleStepForm

Form đơn giản một step:

```tsx
import { SingleStepForm, FormSection, FormGrid } from '@/common/components/patterns';

<SingleStepForm
  onFinish={handleFinish}
  isSubmitting={loading}
  submitText="Lưu"
  layout="vertical"
>
  <FormSection title="Thông tin cơ bản">
    <FormGrid columns={2}>
      <Form.Item label="Tên" name="name" />
      <Form.Item label="Mô tả" name="description" />
    </FormGrid>
  </FormSection>
</SingleStepForm>
```

#### WizardForm

Multi-step form với progress indicator:

```tsx
import { WizardForm } from '@/common/components/patterns';

const steps = [
  { title: 'Thông tin cơ bản', children: <Step1 /> },
  { title: 'Thông tin bổ sung', children: <Step2 /> },
  { title: 'Xác nhận', children: <Step3 /> },
];

<WizardForm
  steps={steps}
  currentStep={current}
  onStepChange={setCurrent}
  onFinish={handleFinish}
/>
```

## Template Generator

Script `generate-module.js` hỗ trợ 3 template types:

```bash
# Basic template (mặc định)
npm run generate:module san-pham

# Advanced template (với sorting, status tags)
npm run generate:module san-pham advanced

# Wizard template (multi-step form)
npm run generate:module san-pham wizard
```

## Best Practices

1. **Ưu tiên base components trước**: Sử dụng BaseTable, BaseForm, BaseModal làm nền tảng
2. **Sử dụng compound components**: Tận dụng BaseTable.Column, BaseForm.Item, etc.
3. **Consistent naming**: Đặt tên columns theo convention (title, dataIndex, key, width, render)
4. **Type safety**: Luôn khai báo types cho data entities
5. **Composition over inheritance**: Build complex UIs từ các atomic components

## Migration Guide

### Từ pages/list/basic-list sang BaseTable

**Trước:**
```tsx
<Card>
  <List
    loading={loading}
    dataSource={list}
    pagination={paginationProps}
    renderItem={(item) => <List.Item>...</List.Item>}
  />
</Card>
```

**Sau:**
```tsx
<BaseTable
  loading={loading}
  dataSource={list}
  columns={columns}
  pagination={paginationProps}
/>
```

### Từ pages/form/step-form sang WizardForm

**Trước:**
```tsx
<StepsForm
  current={current}
  onCurrentChange={setCurrent}
>
  <StepsForm.StepForm title="Step 1">...</StepsForm.StepForm>
  <StepsForm.StepForm title="Step 2">...</StepsForm.StepForm>
</StepsForm>
```

**Sau:**
```tsx
import { WizardForm } from '@/common/components/patterns';

<WizardForm
  steps={steps}
  currentStep={current}
  onStepChange={setCurrent}
/>
```