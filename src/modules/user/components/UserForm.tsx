import { Button, Form, Input } from "antd";
import type { FC } from "react";
import React, { useImperativeHandle, forwardRef, useCallback, useState } from "react";

import BaseForm from "@/common/components/core/base-form";
import {
  useCreateUser,
  useUpdateUser,
} from "../hooks/user.hooks";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
} from "../types/user.types";

export interface UserFormRef {
  setData: (data: User) => void;
  reset: () => void;
}

export interface UserFormProps {
  onSuccess?: () => void;
}

const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ onSuccess }, ref) => {
    const [form] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState<User | null>(null);

    const { run: create, loading: creating } = useCreateUser();
    const { run: update, loading: updating } = useUpdateUser();

    const isSubmitting = creating || updating;

    useImperativeHandle(ref, () => ({
      setData: (data: User) => {
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
      async (values: CreateUserDto | UpdateUserDto) => {
        if (editingRecord?.id) {
          await update({ id: editingRecord.id, data: values as UpdateUserDto });
        } else {
          await create(values as CreateUserDto);
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

UserForm.displayName = "UserForm";

export default UserForm;
