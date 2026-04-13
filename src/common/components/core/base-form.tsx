import {
  Button,
  Form,
  type FormItemProps,
  type FormProps,
  Input,
  InputNumber,
  Select,
} from "antd";
import React, { type ReactNode } from "react";

type FormLayout = "horizontal" | "vertical" | "inline";

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
        <div style={{ fontWeight: 500, marginBottom: 16, color: "#333" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export interface BaseFormItemProps extends FormItemProps {
  type?:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "date"
    | "datetime"
    | "custom";
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  mode?: "multiple" | "tags";
}

export const BaseFormItem: React.FC<BaseFormItemProps> = ({
  type = "text",
  options,
  placeholder,
  mode,
  children,
  ...itemProps
}) => {
  if (type === "custom" || children) {
    return <Form.Item {...itemProps}>{children}</Form.Item>;
  }

  const commonProps = {
    placeholder:
      placeholder ||
      (type === "textarea" ? "Nhập mô tả" : `Nhập ${itemProps.label || ""}`),
  };

  switch (type) {
    case "textarea":
      return (
        <Form.Item {...itemProps}>
          <Input.TextArea {...commonProps} rows={3} />
        </Form.Item>
      );
    case "number":
      return (
        <Form.Item {...itemProps}>
          <InputNumber style={{ width: "100%" }} {...commonProps} />
        </Form.Item>
      );
    case "select":
      return (
        <Form.Item {...itemProps}>
          <Select placeholder={placeholder || "Chọn..."} mode={mode}>
            {options?.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    case "date":
      return (
        <Form.Item {...itemProps}>
          <Input type="date" {...commonProps} />
        </Form.Item>
      );
    case "datetime":
      return (
        <Form.Item {...itemProps}>
          <Input type="datetime-local" {...commonProps} />
        </Form.Item>
      );
    case "text":
    default:
      return (
        <Form.Item {...itemProps}>
          <Input {...commonProps} />
        </Form.Item>
      );
  }
};

export interface BaseFormGridProps {
  columns?: number;
  children: ReactNode;
}

export const BaseFormGrid: React.FC<BaseFormGridProps> = ({
  columns = 2,
  children,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "16px 24px",
      }}
    >
      {children}
    </div>
  );
};

export interface BaseFormLayoutProps {
  direction?: "rtl" | "ltr";
  children: ReactNode;
}

export const BaseFormLayout: React.FC<BaseFormLayoutProps> = ({
  direction = "ltr",
  children,
}) => {
  return (
    <div
      style={{
        direction,
        display: "flex",
        flexDirection: direction === "rtl" ? "row-reverse" : "row",
        gap: "24px",
      }}
    >
      {children}
    </div>
  );
};

export interface BaseFormProps extends Omit<FormProps, "layout" | "children"> {
  layout?: FormLayout;
  labelCol?: { span: number };
  wrapperCol?: { span: number };
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  showActions?: boolean;
  onCancel?: () => void;
  children?: ReactNode;
}

const BaseForm: React.FC<BaseFormProps> = ({
  layout = "horizontal",
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  submitText = "Submit",
  cancelText = "Hủy",
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
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {submitText}
          </Button>
          {onCancel && <Button onClick={onCancel}>{cancelText}</Button>}
        </Form.Item>
      )}
    </Form>
  );
};

type BaseFormCompound = React.FC<BaseFormProps> & {
  Section: typeof BaseFormSection;
  Item: typeof BaseFormItem;
  Grid: typeof BaseFormGrid;
  Layout: typeof BaseFormLayout;
};

(BaseForm as BaseFormCompound).Section = BaseFormSection;
(BaseForm as BaseFormCompound).Item = BaseFormItem;
(BaseForm as BaseFormCompound).Grid = BaseFormGrid;
(BaseForm as BaseFormCompound).Layout = BaseFormLayout;

export default BaseForm as BaseFormCompound;
