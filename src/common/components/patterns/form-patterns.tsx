import { Button, Card, Divider, Form, Space, Steps } from 'antd';
import React, { type FC, type ReactNode } from 'react';

import BaseForm from '../core/base-form';

export interface SingleStepFormProps {
  onFinish?: (values: any) => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  children?: ReactNode;
  layout?: 'horizontal' | 'vertical';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
}

export const SingleStepForm: FC<SingleStepFormProps> = ({
  onFinish,
  isSubmitting = false,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  children,
  layout = 'vertical',
  labelCol,
  wrapperCol,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onFinish?.(values);
    form.resetFields();
  };

  return (
    <BaseForm
      form={form}
      onFinish={handleFinish}
      isSubmitting={isSubmitting}
      onCancel={() => form.resetFields()}
      submitText={submitText}
      cancelText={cancelText}
      layout={layout}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
    >
      {children}
    </BaseForm>
  );
};

export interface FormSectionProps {
  title?: string;
  children: ReactNode;
}

export const FormSection: FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && (
        <>
          <Divider style={{ marginBottom: 16 }} plain>
            {title}
          </Divider>
        </>
      )}
      {children}
    </div>
  );
};

export interface FormGridProps {
  columns?: number;
  children: ReactNode;
}

export const FormGrid: FC<FormGridProps> = ({ columns = 2, children }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px 24px',
      }}
    >
      {children}
    </div>
  );
};

export interface FormLayoutInlineProps {
  children: ReactNode;
}

export const FormLayoutInline: FC<FormLayoutInlineProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {children}
    </div>
  );
};

export interface WizardStepProps {
  title: string;
  children: ReactNode;
}

export interface WizardFormProps {
  steps: WizardStepProps[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onFinish?: (values: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const WizardForm: FC<WizardFormProps> = ({
  steps,
  currentStep = 0,
  onStepChange,
  onFinish,
  onCancel,
  isSubmitting = false,
}) => {
  const [form] = Form.useForm();
  const [stepData, setStepData] = React.useState<Record<number, any>>({});

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setStepData((prev) => ({ ...prev, [currentStep]: values }));
      if (currentStep < steps.length - 1) {
        onStepChange?.(currentStep + 1);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const allData = { ...stepData, [currentStep]: form.getFieldsValue() };
    onFinish?.(allData);
  };

  return (
    <Card>
      <Steps
        current={currentStep}
        items={steps.map((s) => ({ title: s.title }))}
      />
      <div style={{ marginTop: 32 }}>
        <Form form={form} layout="vertical">
          {steps[currentStep]?.children}
        </Form>
      </div>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onCancel}>Hủy</Button>
        <Space>
          {currentStep > 0 && <Button onClick={handlePrev}>Quay lại</Button>}
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="primary"
              loading={isSubmitting}
              onClick={handleFinish}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default {
  SingleStepForm,
  FormSection,
  FormGrid,
  FormLayoutInline,
  WizardForm,
};
