import { Form, Input } from "antd";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";

import BaseForm from "@/common/components/core/base-form";
import { useCreateUser, useUpdateUser } from "@/modules/user/hooks/user.hooks";
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "@/modules/user/types/user.types";

export interface UserFormRef {
  setData: (data: User) => void;
  reset: () => void;
  submit: () => void;
}

const UserForm = forwardRef<UserFormRef, { onSuccess?: () => void }>(
  ({ onSuccess }, ref) => {
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    const { run: create, loading: creating } = useCreateUser();
    const { run: update, loading: updating } = useUpdateUser();

    useImperativeHandle(ref, () => ({
      setData: (data: User) => {
        form.resetFields();
        setEditingId(data.id);
        setTimeout(() => {
          form.setFieldsValue(data);
        }, 0);
      },
      reset: () => {
        setEditingId(null);
        form.resetFields();
      },
      submit: () => form.submit(),
    }));

    const handleSubmit = useCallback(
      async (values: CreateUserDto | UpdateUserDto) => {
        if (editingId) {
          await update({ id: editingId, data: values as UpdateUserDto });
        } else {
          await create(values as CreateUserDto);
        }
        onSuccess?.();
      },
      [editingId, create, update, onSuccess]
    );

    return (
      <BaseForm
        form={form}
        onFinish={handleSubmit}
        isSubmitting={creating || updating}
        submitText={editingId ? "Cập nhật" : "Thêm mới"}
        layout="vertical"
      >
        <Form.Item label="Username" name="username">
          <Input placeholder="Nhập Username" />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <Input placeholder="Nhập Password" />
        </Form.Item>
        <Form.Item label="SoDienThoai" name="soDienThoai">
          <Input placeholder="Nhập SoDienThoai" />
        </Form.Item>
        <Form.Item label="NgaySinh" name="ngaySinh">
          <Input placeholder="Nhập NgaySinh" />
        </Form.Item>
        <Form.Item label="AvatarUrl" name="avatarUrl">
          <Input placeholder="Nhập AvatarUrl" />
        </Form.Item>
        <Form.Item label="DiaChi" name="diaChi">
          <Input placeholder="Nhập DiaChi" />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input placeholder="Nhập Email" />
        </Form.Item>
        <Form.Item
          label="HoTen"
          name="hoTen"
          rules={[{ required: true, message: "Vui lòng nhập HoTen" }]}
        >
          <Input placeholder="Nhập HoTen" />
        </Form.Item>
        <Form.Item
          label="VaiTro"
          name="vaiTro"
          rules={[{ required: true, message: "Vui lòng nhập VaiTro" }]}
        >
          <Input placeholder="Nhập VaiTro" />
        </Form.Item>
        <Form.Item label="Active" name="active">
          <Input placeholder="Nhập Active" />
        </Form.Item>
      </BaseForm>
    );
  }
);

UserForm.displayName = "UserForm";

export default UserForm;
