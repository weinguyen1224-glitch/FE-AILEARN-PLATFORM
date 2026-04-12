import { Button, Form, type FormProps, Space } from 'antd';
import React, { type ReactNode } from 'react';

type FormLayout = 'horizontal' | 'vertical' | 'inline';

export interface BaseFormSectionProps {
  title?: string;
  children: ReactNode;
}

export const BaseFormSection: React.FC<BaseFormSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && (
        <div style={{ fontWeight: 500, marginBottom: 16, color: '#333' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export interface BaseFormProps extends Omit<FormProps, 'layout' | 'children'> {
  layout?: FormLayout;
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  submitText?: string;
  isSubmitting?: boolean;
  showActions?: boolean;
  onCancel?: () => void;
  children?: ReactNode;
}

const BaseForm: React.FC<BaseFormProps> = ({
  layout = 'horizontal',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  submitText = 'Submit',
  isSubmitting = false,
  showActions = true,
  onCancel,
  children,
  ...formProps
}) => {
  return (
    <Form
      layout={layout}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      {...formProps}
    >
      {children}
      {showActions && (
        <Form.Item
          wrapperCol={{ offset: labelCol.span, span: wrapperCol.span }}
        >
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {submitText}
            </Button>
            {onCancel && <Button onClick={onCancel}>Hủy</Button>}
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

export default BaseForm;
