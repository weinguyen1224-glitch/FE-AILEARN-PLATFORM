import { Button, Form, Input } from 'antd';
import type { FC } from 'react';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';

import BaseForm from '@/common/components/core/base-form';
import { useCreateTest, useUpdateTest } from '../hooks/test.hooks';
import type { CreateTestDto, Test, UpdateTestDto } from '../types/test.types';

export interface TestFormRef {
  setData: (data: Test) => void;
  reset: () => void;
  submit: () => void;
}

export interface TestFormProps {
  onSuccess?: () => void;
}

const TestForm = forwardRef<TestFormRef, TestFormProps>(
  ({ onSuccess }, ref) => {
    const [form] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState<Test | null>(null);

    const { run: create, loading: creating } = useCreateTest();
    const { run: update, loading: updating } = useUpdateTest();

    const isSubmitting = creating || updating;

    useImperativeHandle(ref, () => ({
      setData: (data: Test) => {
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
      async (values: CreateTestDto | UpdateTestDto) => {
        if (editingRecord?.id) {
          await update({ id: editingRecord.id, data: values as UpdateTestDto });
        } else {
          await create(values as CreateTestDto);
        }
        onSuccess?.();
      },
      [editingRecord, create, update, onSuccess],
    );

    return (
      <BaseForm
        form={form}
        onFinish={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={editingRecord?.id ? 'Cập nhật' : 'Tạo mới'}
        layout="vertical"
      >
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder="Nhập tên" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea placeholder="Nhập mô tả" rows={3} />
        </Form.Item>
      </BaseForm>
    );
  },
);

TestForm.displayName = 'TestForm';

export default TestForm;
