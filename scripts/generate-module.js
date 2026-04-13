#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Tự động thêm route mới vào config/routes.ts
 * Route được chèn vào trước dòng redirect "/" ở cuối file
 */
function updateRoutes(routesFilePath, moduleNameLower, moduleNameUpper) {
  if (!fs.existsSync(routesFilePath)) {
    console.warn("Cannot find routes.ts at: " + routesFilePath);
    return;
  }

  const content = fs.readFileSync(routesFilePath, "utf8");

  // Kiem tra route da ton tai chua
  const checkSingle = "path: '/" + moduleNameLower + "'";
  const checkDouble = 'path: "/' + moduleNameLower + '"';
  if (content.includes(checkSingle) || content.includes(checkDouble)) {
    console.log(
      "Route /" + moduleNameLower + " da ton tai trong routes.ts, bo qua."
    );
    return;
  }

  const newRoute =
    "  {\n" +
    "    path: '/" +
    moduleNameLower +
    "',\n" +
    "    name: '" +
    moduleNameLower +
    "',\n" +
    "    icon: 'table',\n" +
    "    component: '@/pages/" +
    moduleNameLower +
    "',\n" +
    "  },";

  // Tim vi tri redirect root "/" de chen vao truoc
  const redirectMarkerDouble = 'path: "/"';
  const redirectMarkerSingle = "path: '/'";
  let insertIdx = -1;

  let rIdx = content.indexOf(redirectMarkerDouble);
  if (rIdx === -1) rIdx = content.indexOf(redirectMarkerSingle);

  if (rIdx !== -1) {
    // Tim dau cua block { chua redirect nay (tim nguoc len)
    insertIdx = content.lastIndexOf("\n  {", rIdx);
    if (insertIdx === -1) insertIdx = content.lastIndexOf("{", rIdx);
  }

  if (insertIdx !== -1) {
    const updated =
      content.slice(0, insertIdx) + "\n" + newRoute + content.slice(insertIdx);
    fs.writeFileSync(routesFilePath, updated, "utf8");
    console.log("Da them route /" + moduleNameLower + " vao routes.ts");
  } else {
    // Fallback: chen truoc dong component 404
    const marker404Double = 'component: "404"';
    const marker404Single = "component: '404'";
    let idx404 = content.indexOf(marker404Double);
    if (idx404 === -1) idx404 = content.indexOf(marker404Single);

    if (idx404 !== -1) {
      const blockStart = content.lastIndexOf("\n  {", idx404);
      if (blockStart !== -1) {
        const updated =
          content.slice(0, blockStart) +
          "\n" +
          newRoute +
          content.slice(blockStart);
        fs.writeFileSync(routesFilePath, updated, "utf8");
        console.log(
          "Da them route /" + moduleNameLower + " vao routes.ts (fallback)"
        );
        return;
      }
    }
    console.warn("Khong the tu dong chen route. Them thu cong vao routes.ts:");
    console.warn(newRoute);
  }
}

/**
 * Script generate module for ant-design-pro
 *
 * Tạo:
 * - src/modules/{name}/ (business logic)
 *   - types/
 *   - service/
 *   - hooks/
 *   - components/
 *     - [Name]Table.tsx  (kế thừa BaseTable)
 *     - [Name]Form.tsx   (kế thừa BaseForm)
 * - src/pages/{name}/index.tsx (sử dụng Table + Form)
 *
 * Usage: npm run generate:module san-pham [basic|advanced|wizard]
 *   - basic: Form đơn giản, một trang
 *   - advanced: Form có sections, grid layout, nhiều field types
 *   - wizard: Multi-step form với progress indicator
 */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Vui lòng cung cấp tên module!");
  console.log(
    "Usage: npm run generate:module san-pham [basic|advanced|wizard]"
  );
  console.log("  basic     - Form đơn giản, một trang (mặc định)");
  console.log("  advanced  - Form có sections, grid layout");
  console.log("  wizard    - Multi-step form với progress");
  process.exit(1);
}

const rawName = args[0];
const templateType = args[1] || "basic";

if (!["basic", "advanced", "wizard"].includes(templateType)) {
  console.error("❌ Template type không hợp lệ!");
  console.log("Template types: basic, advanced, wizard");
  process.exit(1);
}

const moduleNameLower = rawName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

const toCamel = (str) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const moduleNameCamel =
  toCamel(rawName).charAt(0).toLowerCase() + toCamel(rawName).slice(1);

const moduleNameUpper =
  toCamel(rawName).charAt(0).toUpperCase() + toCamel(rawName).slice(1);

console.log(
  `🚀 Generating module: ${moduleNameUpper} (template: ${templateType})`
);

const root = process.cwd();

const modulesDir = path.join(root, "src", "modules");
const moduleDir = path.join(modulesDir, moduleNameLower);
const componentsDir = path.join(moduleDir, "components");

const pagesDir = path.join(root, "src", "pages", moduleNameLower);

const layers = ["types", "service", "hooks", "components"];
const dirs = [moduleDir, ...layers.map((l) => path.join(moduleDir, l))];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

const typesTemplate = `import { BaseEntity } from "@/config/types/base.types";

export interface ${moduleNameUpper} extends BaseEntity {
  name: string;
  description?: string;
}

export interface Create${moduleNameUpper}Dto
  extends Omit<${moduleNameUpper}, "id" | "createdAt" | "updatedAt" | "deletedAt" | "stt" | "ma"> {
}

export interface Update${moduleNameUpper}Dto
  extends Partial<Create${moduleNameUpper}Dto> {
}
`;

const serviceTemplate = `import { BaseService } from "@/config/service/base.service";
import {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto
} from "../types/${moduleNameLower}.types";

export class ${moduleNameUpper}Service extends BaseService<
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto
> {
  protected resourcePath = "/${moduleNameLower}";
}

export const ${moduleNameCamel}Service = new ${moduleNameUpper}Service();
`;

const hooksTemplate = `import { useRequest } from "@umijs/max";
import { ${moduleNameCamel}Service } from "../service/${moduleNameLower}.service";
import type {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto,
} from "../types/${moduleNameLower}.types";

export const useGet${moduleNameUpper}Page = (options?: any, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.getPage(options), {
    ...queryOptions,
  });
};

export const useGet${moduleNameUpper}List = (options?: any, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.getMany(options), {
    ...queryOptions,
  });
};

export const useCount${moduleNameUpper} = (options?: any, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.count(options), {
    ...queryOptions,
  });
};

export const useGet${moduleNameUpper}One = (options?: any, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.getOne(options), {
    ...queryOptions,
  });
};

export const useExists${moduleNameUpper} = (options?: any, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.exists(options), {
    ...queryOptions,
  });
};

export const useGet${moduleNameUpper}ById = (id: number | undefined, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.findById(id!), {
    ready: !!id,
    ...queryOptions,
  });
};

export const useGet${moduleNameUpper}ByMa = (ma: string | undefined, queryOptions?: any) => {
  return useRequest(() => ${moduleNameCamel}Service.findByMa(ma!), {
    ready: !!ma,
    ...queryOptions,
  });
};

export const useCreate${moduleNameUpper} = () => {
  return useRequest(
    (data: Create${moduleNameUpper}Dto) => ${moduleNameCamel}Service.create(data),
    { manual: true }
  );
};

export const useUpdate${moduleNameUpper} = () => {
  return useRequest(
    ({ id, data }: { id: number; data: Update${moduleNameUpper}Dto }) =>
      ${moduleNameCamel}Service.update(id, data),
    { manual: true }
  );
};

export const useUpdateMany${moduleNameUpper} = () => {
  return useRequest(
    ({
      filter,
      data,
    }: {
      filter: Record<string, unknown>;
      data: Partial<${moduleNameUpper}>;
    }) => ${moduleNameCamel}Service.updateMany(filter, data),
    { manual: true }
  );
};

export const useDelete${moduleNameUpper} = () => {
  return useRequest((id: number) => ${moduleNameCamel}Service.remove(id), { manual: true });
};

export const useDeleteMany${moduleNameUpper} = () => {
  return useRequest(
    (filter: Record<string, unknown>) => ${moduleNameCamel}Service.deleteMany(filter),
    { manual: true }
  );
};

export const useSoftDelete${moduleNameUpper} = () => {
  return useRequest(
    (filter: Record<string, unknown>) => ${moduleNameCamel}Service.softDelete(filter),
    { manual: true }
  );
};

export const useRestore${moduleNameUpper} = () => {
  return useRequest(
    (filter: Record<string, unknown>) => ${moduleNameCamel}Service.restore(filter),
    { manual: true }
  );
};
`;

const indexTemplate = `export * from "./types/${moduleNameLower}.types";
export * from "./service/${moduleNameLower}.service";
export * from "./hooks/${moduleNameLower}.hooks";
export * from "./components/${moduleNameUpper}Table";
export * from "./components/${moduleNameUpper}Form";
`;

const basicTableTemplate = `import { useBoolean } from "ahooks";
import { Button, Space } from "antd";
import type { FC } from "react";
import React from "react";

import BaseTable from "@/common/components/core/base-table";
import BaseModal from "@/common/components/core/base-modal";
import {
  useGet${moduleNameUpper}Page,
  useDelete${moduleNameUpper},
} from "../hooks/${moduleNameLower}.hooks";
import type { ${moduleNameUpper} } from "../types/${moduleNameLower}.types";

import type { ${moduleNameUpper}FormRef } from "./${moduleNameUpper}Form";
import ${moduleNameUpper}Form from "./${moduleNameUpper}Form";

export interface ${moduleNameUpper}TableProps {
  onEdit?: (record: ${moduleNameUpper}) => void;
}

const ${moduleNameUpper}Table: FC<${moduleNameUpper}TableProps> = ({ onEdit }) => {
  const { data, loading, refresh } = useGet${moduleNameUpper}Page();
  const { run: deleteRecord, loading: deleting } = useDelete${moduleNameUpper}();

  const [deleteModalOpen, { setTrue: openDeleteModal, setFalse: closeDeleteModal }] =
    useBoolean(false);
  const [selectedRecord, setSelectedRecord] = React.useState<${moduleNameUpper} | null>(null);

  const [formOpen, { setTrue: openForm, setFalse: closeForm }] = useBoolean(false);
  const formRef = React.useRef<${moduleNameUpper}FormRef>(null);

  const handleDelete = (record: ${moduleNameUpper}) => {
    setSelectedRecord(record);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (selectedRecord?.id) {
      await deleteRecord(selectedRecord.id);
      closeDeleteModal();
      refresh();
    }
  };

  const handleEdit = (record: ${moduleNameUpper}) => {
    setSelectedRecord(record);
    formRef.current?.setData(record);
    openForm();
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    formRef.current?.reset();
    openForm();
  };

  const handleFormSuccess = () => {
    closeForm();
    refresh();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_: any, record: ${moduleNameUpper}) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const deleteContent = selectedRecord?.id
    ? "Bạn có chắc chắn muốn xóa '" + selectedRecord.name + "'? Hành động này không thể hoàn tác."
    : "Bạn có chắc chắn muốn xóa?";

  return (
    <>
      <BaseTable<${moduleNameUpper}>
        headerTitle={
          <Button type="primary" onClick={handleCreate}>
            Thêm mới
          </Button>
        }
        loading={loading}
        dataSource={data?.data}
        columns={columns}
        rowKey="id"
        pagination={data?.pagination}
      />

      <BaseModal.Form
        open={formOpen}
        title={selectedRecord?.id ? "Sửa ${moduleNameUpper}" : "Thêm mới ${moduleNameUpper}"}
        onCancel={closeForm}
        onSubmit={() => formRef.current?.submit()}
        loading={false}
      >
        <${moduleNameUpper}Form
          ref={formRef}
          open={formOpen}
          onOpenChange={closeForm}
          onSuccess={handleFormSuccess}
        />
      </BaseModal.Form>

      <BaseModal.Confirm
        open={deleteModalOpen}
        title="Xác nhận xóa"
        content={deleteContent}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isConfirming={deleting}
        icon="danger"
      />
    </>
  );
};

export default ${moduleNameUpper}Table;
`;

const advancedTableTemplate = `import { useBoolean } from "ahooks";
import { Button, Space, Tag } from "antd";
import type { FC } from "react";
import React from "react";

import BaseTable from "@/common/components/core/base-table";
import BaseModal from "@/common/components/core/base-modal";
import {
  useGet${moduleNameUpper}Page,
  useDelete${moduleNameUpper},
} from "../hooks/${moduleNameLower}.hooks";
import type { ${moduleNameUpper} } from "../types/${moduleNameLower}.types";

import type { ${moduleNameUpper}FormRef } from "./${moduleNameUpper}Form";
import ${moduleNameUpper}Form from "./${moduleNameUpper}Form";

export interface ${moduleNameUpper}TableProps {
  onEdit?: (record: ${moduleNameUpper}) => void;
  onView?: (record: ${moduleNameUpper}) => void;
}

const ${moduleNameUpper}Table: FC<${moduleNameUpper}TableProps> = ({ onEdit, onView }) => {
  const { data, loading, refresh } = useGet${moduleNameUpper}Page();
  const { run: deleteRecord, loading: deleting } = useDelete${moduleNameUpper}();

  const [deleteModalOpen, { setTrue: openDeleteModal, setFalse: closeDeleteModal }] =
    useBoolean(false);
  const [selectedRecord, setSelectedRecord] = React.useState<${moduleNameUpper} | null>(null);

  const [formOpen, { setTrue: openForm, setFalse: closeForm }] = useBoolean(false);
  const formRef = React.useRef<${moduleNameUpper}FormRef>(null);

  const handleDelete = (record: ${moduleNameUpper}) => {
    setSelectedRecord(record);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (selectedRecord?.id) {
      await deleteRecord(selectedRecord.id);
      closeDeleteModal();
      refresh();
    }
  };

  const handleEdit = (record: ${moduleNameUpper}) => {
    setSelectedRecord(record);
    formRef.current?.setData(record);
    openForm();
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    formRef.current?.reset();
    openForm();
  };

  const handleFormSuccess = () => {
    closeForm();
    refresh();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: true,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      sorter: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: "green",
          inactive: "red",
          pending: "orange",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: any, record: ${moduleNameUpper}) => (
        <Space>
          {onView && (
            <Button type="link" onClick={() => onView(record)}>
              Chi tiết
            </Button>
          )}
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const deleteContent = selectedRecord?.id
    ? "Bạn có chắc chắn muốn xóa '" + selectedRecord.name + "'? Hành động này không thể hoàn tác."
    : "Bạn có chắc chắn muốn xóa?";

  return (
    <>
      <BaseTable<${moduleNameUpper}>
        headerTitle={
          <Space>
            <Button type="primary" onClick={handleCreate}>
              Thêm mới
            </Button>
          </Space>
        }
        loading={loading}
        dataSource={data?.data}
        columns={columns}
        rowKey="id"
        pagination={data?.pagination}
        scroll={{ x: 800 }}
      />

      <BaseModal.Form
        open={formOpen}
        title={selectedRecord?.id ? "Sửa ${moduleNameUpper}" : "Thêm mới ${moduleNameUpper}"}
        onCancel={closeForm}
        onSubmit={() => formRef.current?.submit()}
        loading={false}
      >
        <${moduleNameUpper}Form
          ref={formRef}
          open={formOpen}
          onOpenChange={closeForm}
          onSuccess={handleFormSuccess}
        />
      </BaseModal.Form>

      <BaseModal.Confirm
        open={deleteModalOpen}
        title="Xác nhận xóa"
        content={deleteContent}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isConfirming={deleting}
        icon="danger"
      />
    </>
  );
};

export default ${moduleNameUpper}Table;
`;

const basicFormTemplate = `import { Button, Form, Input } from "antd";
import type { FC } from "react";
import React, { useImperativeHandle, forwardRef, useCallback, useState } from "react";

import BaseForm from "@/common/components/core/base-form";
import {
  useCreate${moduleNameUpper},
  useUpdate${moduleNameUpper},
} from "../hooks/${moduleNameLower}.hooks";
import type {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto,
} from "../types/${moduleNameLower}.types";

export interface ${moduleNameUpper}FormRef {
  setData: (data: ${moduleNameUpper}) => void;
  reset: () => void;
}

export interface ${moduleNameUpper}FormProps {
  onSuccess?: () => void;
}

const ${moduleNameUpper}Form = forwardRef<${moduleNameUpper}FormRef, ${moduleNameUpper}FormProps>(
  ({ onSuccess }, ref) => {
    const [form] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState<${moduleNameUpper} | null>(null);

    const { run: create, loading: creating } = useCreate${moduleNameUpper}();
    const { run: update, loading: updating } = useUpdate${moduleNameUpper}();

    const isSubmitting = creating || updating;

    useImperativeHandle(ref, () => ({
      setData: (data: ${moduleNameUpper}) => {
        setEditingRecord(data);
        form.setFieldsValue(data);
      },
      reset: () => {
        setEditingRecord(null);
        form.resetFields();
      },
      submit: () => {
        form.submit();
      },
    }));

    const handleSubmit = useCallback(
      async (values: Create${moduleNameUpper}Dto | Update${moduleNameUpper}Dto) => {
        if (editingRecord?.id) {
          await update({ id: editingRecord.id, data: values as Update${moduleNameUpper}Dto });
        } else {
          await create(values as Create${moduleNameUpper}Dto);
        }
        onSuccess?.();
      },
      [editingRecord, create, update, onSuccess]
    );

    return (
      <BaseForm
        form={form}
        onFinish={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={editingRecord?.id ? "Cập nhật" : "Tạo mới"}
        layout="vertical"
      >
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input placeholder="Nhập tên" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea placeholder="Nhập mô tả" rows={3} />
        </Form.Item>
      </BaseForm>
    );
  }
);

${moduleNameUpper}Form.displayName = "${moduleNameUpper}Form";

export default ${moduleNameUpper}Form;
`;

const advancedFormTemplate = `import { Button, Form, Input, InputNumber, Select, Divider } from "antd";
import type { FC } from "react";
import React, { useImperativeHandle, forwardRef, useCallback, useState } from "react";

import BaseForm from "@/common/components/core/base-form";
import {
  useCreate${moduleNameUpper},
  useUpdate${moduleNameUpper},
} from "../hooks/${moduleNameLower}.hooks";
import type {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto,
} from "../types/${moduleNameLower}.types";

export interface ${moduleNameUpper}FormRef {
  setData: (data: ${moduleNameUpper}) => void;
  reset: () => void;
}

export interface ${moduleNameUpper}FormProps {
  onSuccess?: () => void;
  size?: "sm" | "md" | "lg";
}

const ${moduleNameUpper}Form = forwardRef<${moduleNameUpper}FormRef, ${moduleNameUpper}FormProps>(
  ({ onSuccess, size = "md" }, ref) => {
    const [form] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState<${moduleNameUpper} | null>(null);

    const { run: create, loading: creating } = useCreate${moduleNameUpper}();
    const { run: update, loading: updating } = useUpdate${moduleNameUpper}();

    const isSubmitting = creating || updating;

    useImperativeHandle(ref, () => ({
      setData: (data: ${moduleNameUpper}) => {
        setEditingRecord(data);
        form.setFieldsValue(data);
      },
      reset: () => {
        setEditingRecord(null);
        form.resetFields();
      },
      submit: () => {
        form.submit();
      },
    }));

    const handleSubmit = useCallback(
      async (values: Create${moduleNameUpper}Dto | Update${moduleNameUpper}Dto) => {
        if (editingRecord?.id) {
          await update({ id: editingRecord.id, data: values as Update${moduleNameUpper}Dto });
        } else {
          await create(values as Create${moduleNameUpper}Dto);
        }
        onSuccess?.();
      },
      [editingRecord, create, update, onSuccess]
    );

    const widthMap = { sm: 300, md: 450, lg: 600 };

    return (
      <BaseForm
        form={form}
        onFinish={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={editingRecord?.id ? "Cập nhật" : "Tạo mới"}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Divider orientation="left">Thông tin cơ bản</Divider>

        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input placeholder="Nhập tên" style={{ width: widthMap[size] }} />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea placeholder="Nhập mô tả" rows={3} style={{ width: widthMap[size] }} />
        </Form.Item>

        <Divider orientation="left">Cài đặt nâng cao</Divider>

        <Form.Item label="Ghi chú" name="notes">
          <Input.TextArea placeholder="Ghi chú bổ sung" rows={2} style={{ width: widthMap[size] }} />
        </Form.Item>

        <Form.Item label="Thứ tự" name="sortOrder">
          <InputNumber min={0} placeholder="0" style={{ width: 150 }} />
        </Form.Item>
      </BaseForm>
    );
  }
);

${moduleNameUpper}Form.displayName = "${moduleNameUpper}Form";

export default ${moduleNameUpper}Form;
`;

const wizardFormTemplate = `import { StepsForm, ProFormText, ProFormSelect } from "@ant-design/pro-components";
import { Button, Card, Result, Alert, Space, Divider } from "antd";
import type { FC } from "react";
import React, { useState } from "react";

import BaseForm from "@/common/components/core/base-form";
import {
  useCreate${moduleNameUpper},
  useUpdate${moduleNameUpper},
} from "../hooks/${moduleNameLower}.hooks";
import type {
  ${moduleNameUpper},
  Create${moduleNameUpper}Dto,
  Update${moduleNameUpper}Dto,
} from "../types/${moduleNameLower}.types";

export interface ${moduleNameUpper}FormProps {
  onSuccess?: () => void;
}

interface StepData {
  basicInfo?: Partial<${moduleNameUpper}>;
  additionalInfo?: Partial<${moduleNameUpper}>;
  review?: boolean;
}

const ${moduleNameUpper}Form: FC<${moduleNameUpper}FormProps> = ({ onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [stepData, setStepData] = useState<StepData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { run: create } = useCreate${moduleNameUpper}();
  const { run: update } = useUpdate${moduleNameUpper}();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (stepData.basicInfo?.id) {
        await update({ id: stepData.basicInfo.id, data: stepData.basicInfo as Update${moduleNameUpper}Dto });
      } else {
        await create(stepData.basicInfo as Create${moduleNameUpper}Dto);
      }
      onSuccess?.();
      setCurrent(0);
      setStepData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCurrent(0);
    setStepData({});
  };

  return (
    <StepsForm
      current={current}
      onCurrentChange={setCurrent}
      submitter={{
        render: (props, dom) => {
          if (current === 2) {
            return (
              <Space>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" loading={isSubmitting} onClick={handleSubmit}>
                  Hoàn thành
                </Button>
              </Space>
            );
          }
          return dom;
        },
      }}
    >
      <StepsForm.StepForm
        title="Thông tin cơ bản"
        onFinish={async (values) => {
          setStepData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, ...values } }));
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="Tên"
          placeholder="Nhập tên"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        />
        <ProFormText
          name="description"
          label="Mô tả"
          placeholder="Nhập mô tả"
        />
      </StepsForm.StepForm>

      <StepsForm.StepForm
        title="Thông tin bổ sung"
        onFinish={async (values) => {
          setStepData((prev) => ({ ...prev, additionalInfo: values }));
          return true;
        }}
      >
        <ProFormText
          name="notes"
          label="Ghi chú"
          placeholder="Nhập ghi chú"
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={[
            { label: "Hoạt động", value: "active" },
            { label: "Không hoạt động", value: "inactive" },
          ]}
        />
      </StepsForm.StepForm>

      <StepsForm.StepForm title="Xác nhận">
        <Card>
          <Alert
            message="Xác nhận thông tin"
            description="Vui lòng kiểm tra thông tin trước khi hoàn thành."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Divider />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <strong>Tên:</strong> {stepData.basicInfo?.name || "-"}
            </div>
            <div>
              <strong>Mô tả:</strong> {stepData.basicInfo?.description || "-"}
            </div>
            <div>
              <strong>Ghi chú:</strong> {stepData.additionalInfo?.notes || "-"}
            </div>
            <div>
              <strong>Trạng thái:</strong> {stepData.additionalInfo?.status || "-"}
            </div>
          </div>
        </Card>
        <Result
          status="success"
          title="Sẵn sàng hoàn thành"
          subTitle="Nhấn 'Hoàn thành' để lưu thông tin."
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default ${moduleNameUpper}Form;
`;

const tableTemplate =
  templateType === "advanced" ? advancedTableTemplate : basicTableTemplate;
const formTemplate =
  templateType === "wizard"
    ? wizardFormTemplate
    : templateType === "advanced"
    ? advancedFormTemplate
    : basicFormTemplate;

const pageTemplate = `import { PageContainer } from "@ant-design/pro-components";
import type { FC } from 'react';
import React from 'react';

import ${moduleNameUpper}Table from '@/modules/${moduleNameLower}/components/${moduleNameUpper}Table';

const ${moduleNameUpper}Page: FC = () => {
  return (
    <PageContainer
      title="Quản lý ${moduleNameUpper}"
      subTitle="Danh sách và thao tác với ${moduleNameLower}"
    >
      <div style={{ padding: 24 }}>
        <${moduleNameUpper}Table />
      </div>
    </PageContainer>
  );
};

export default ${moduleNameUpper}Page;
`;

const wizardPageTemplate = `import { PageContainer } from "@ant-design/pro-components";
import { Button, Card, Space } from "antd";
import type { FC } from 'react';
import React, { useState } from 'react';

import BaseModal from "@/common/components/core/base-modal";
import ${moduleNameUpper}Table from '@/modules/${moduleNameLower}/components/${moduleNameUpper}Table';
import ${moduleNameUpper}Form from '@/modules/${moduleNameLower}/components/${moduleNameUpper}Form';

const ${moduleNameUpper}Page: FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setFormOpen(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <PageContainer
      title="Quản lý ${moduleNameUpper}"
      subTitle="Wizard form cho multi-step operations"
      extra={
        <Button type="primary" onClick={() => setFormOpen(true)}>
          Thêm mới (Wizard)
        </Button>
      }
    >
      <div style={{ padding: 24 }}>
        <Card style={{ marginBottom: 24 }}>
          <${moduleNameUpper}Table key={refreshKey} />
        </Card>

        <BaseModal.Form
          open={formOpen}
          title="Wizard Form"
          onCancel={() => setFormOpen(false)}
          onSubmit={() => {}}
          loading={false}
        >
          <${moduleNameUpper}Form onSuccess={handleSuccess} />
        </BaseModal.Form>
      </div>
    </PageContainer>
  );
};

export default ${moduleNameUpper}Page;
`;

const finalPageTemplate =
  templateType === "wizard" ? wizardPageTemplate : pageTemplate;

const files = [
  { p: `types/${moduleNameLower}.types.ts`, c: typesTemplate },
  { p: `service/${moduleNameLower}.service.ts`, c: serviceTemplate },
  { p: `hooks/${moduleNameLower}.hooks.ts`, c: hooksTemplate },
  { p: `index.ts`, c: indexTemplate },
];

files.forEach(({ p, c }) => {
  const full = path.join(moduleDir, p);
  fs.writeFileSync(full, c, "utf8");
  console.log("✅ Created:", full);
});

const tablePath = path.join(componentsDir, `${moduleNameUpper}Table.tsx`);
fs.writeFileSync(tablePath, tableTemplate, "utf8");
console.log("✅ Created:", tablePath);

const formPath = path.join(componentsDir, `${moduleNameUpper}Form.tsx`);
fs.writeFileSync(formPath, formTemplate, "utf8");
console.log("✅ Created:", formPath);

const pagePath = path.join(pagesDir, "index.tsx");
fs.writeFileSync(pagePath, finalPageTemplate, "utf8");
console.log("✅ Created:", pagePath);

// Tự động cập nhật routes.ts
const routesFilePath = path.join(root, "config", "routes.ts");
updateRoutes(routesFilePath, moduleNameLower, moduleNameUpper);

console.log(
  `\n✨ Module ${moduleNameUpper} generated successfully with "${templateType}" template!`
);
console.log(`\n📁 Structure:`);
console.log(`   src/modules/${moduleNameLower}/`);
console.log(`   ├── types/`);
console.log(`   ├── service/`);
console.log(`   ├── hooks/`);
console.log(`   ├── components/`);
console.log(`   │   ├── ${moduleNameUpper}Table.tsx`);
console.log(`   │   └── ${moduleNameUpper}Form.tsx`);
console.log(`   └── index.ts`);
console.log(`   src/pages/${moduleNameLower}/`);
console.log(`   └── index.tsx`);
console.log(`\n📋 Template Features (${templateType}):`);
if (templateType === "basic") {
  console.log(`   - Single page form`);
  console.log(`   - Basic table with ID, Name, Description, Actions`);
  console.log(`   - Vertical form layout`);
} else if (templateType === "advanced") {
  console.log(`   - Advanced table with sorting, status tags, fixed columns`);
  console.log(`   - Sectioned form with dividers`);
  console.log(`   - Horizontal form layout with width control`);
} else if (templateType === "wizard") {
  console.log(`   - Multi-step form with progress indicator`);
  console.log(`   - 3 steps: Basic Info -> Additional Info -> Confirmation`);
  console.log(`   - Page with separate wizard button`);
}
console.log(`\n🛣️  Route đã được tự động thêm vào config/routes.ts:`);
console.log(
  `   { path: '/${moduleNameLower}', name: '${moduleNameLower}', icon: 'table', component: '@/pages/${moduleNameLower}' }`
);
