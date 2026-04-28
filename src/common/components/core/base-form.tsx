import {
  ModalForm,
  ProForm,
  type ProFormProps,
} from "@ant-design/pro-components";
import { Button, Card, Divider } from "antd";
import type { ReactElement, ReactNode } from "react";
import React, { useState } from "react";

export interface BaseFormProps extends ProFormProps<any> {
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  showReset?: boolean;
  resetText?: string;
  onCancel?: () => void;
  carded?: boolean;
  cardTitle?: string;
  cardSubtitle?: string;
  actionsPosition?: "start" | "center" | "end";
  children?: ReactNode;
  isSubmitting?: boolean;
}

const BaseForm: React.FC<BaseFormProps> = ({
  submitText = "Lưu",
  cancelText = "Hủy",
  loading = false,
  showReset = false,
  resetText = "Đặt lại",
  onCancel,
  carded = false,
  cardTitle,
  cardSubtitle,
  actionsPosition = "start",
  isSubmitting,
  children,
  ...restProps
}) => {
  const content = (
    <>
      {children}
      <div
        style={{
          display: "flex",
          justifyContent:
            actionsPosition === "end"
              ? "flex-end"
              : actionsPosition === "center"
              ? "center"
              : "flex-start",
          gap: 12,
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        {showReset && (
          <Button htmlType="reset" disabled={loading}>
            {resetText}
          </Button>
        )}
        {onCancel && (
          <Button onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}
      </div>
    </>
  );

  if (carded) {
    return (
      <Card
        title={
          cardTitle && (
            <span style={{ fontWeight: 600, fontSize: 16 }}>{cardTitle}</span>
          )
        }
        extra={
          cardSubtitle && (
            <span style={{ fontSize: 13, color: "#8c8c8c" }}>
              {cardSubtitle}
            </span>
          )
        }
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
        styles={{ body: { padding: 24 } }}
      >
        <ProForm submitter={false} {...restProps}>
          {content}
        </ProForm>
      </Card>
    );
  }

  return (
    <ProForm submitter={false} {...restProps}>
      {content}
    </ProForm>
  );
};

export interface BaseModalFormProps {
  trigger?: ReactElement;
  title?: string;
  width?: number | string;
  loading?: boolean;
  onFinish?: (values: any) => Promise<boolean | void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  children?: ReactNode;
}

const BaseModalForm: React.FC<BaseModalFormProps> = ({
  trigger,
  title = "Form",
  width = 400,
  onFinish,
  open,
  onOpenChange,
  onCancel,
  children,
}) => {
  return (
    <ModalForm
      title={title}
      trigger={trigger}
      width={width}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onFinish}
      modalProps={{
        destroyOnHidden: true,
        onCancel,
      }}
    >
      {children}
    </ModalForm>
  );
};

export interface BaseFormSectionProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const BaseFormSection: React.FC<BaseFormSectionProps> = ({
  title,
  icon,
  children,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      style={{
        marginBottom: 24,
        border: "1px solid #f0f0f0",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {title && (
        <div
          onClick={() => collapsible && setCollapsed(!collapsed)}
          style={{
            padding: "12px 16px",
            background: "#fafafa",
            borderBottom: collapsed ? "none" : "1px solid #f0f0f0",
            fontWeight: 600,
            fontSize: 14,
            color: "#262626",
            cursor: collapsible ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 8,
            userSelect: "none",
          }}
        >
          {icon && <span style={{ color: "#1890ff" }}>{icon}</span>}
          <span>{title}</span>
          {collapsible && (
            <span
              style={{
                marginLeft: "auto",
                transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                fontSize: 10,
              }}
            >
              ▼
            </span>
          )}
        </div>
      )}
      {!collapsed && <div style={{ padding: "16px 20px" }}>{children}</div>}
    </div>
  );
};

export interface BaseFormDividerProps {
  title?: string;
  orientation?: "left" | "center" | "right";
  dashed?: boolean;
}

export const BaseFormDivider: React.FC<BaseFormDividerProps> = ({
  title,
  orientation = "center",
  dashed = false,
}) => {
  return (
    <Divider style={{ margin: "20px 0" }}>
      {title && (
        <span style={{ fontWeight: 500, fontSize: 14, color: "#595959" }}>
          {title}
        </span>
      )}
    </Divider>
  );
};

export interface BaseFormGridProps {
  columns?: number;
  gap?: number | string;
  children: ReactNode;
}

export const BaseFormGrid: React.FC<BaseFormGridProps> = ({
  columns = 2,
  gap = 16,
  children,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: typeof gap === "number" ? `${gap}px` : gap,
      }}
    >
      {children}
    </div>
  );
};

export {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";

export type { ModalFormProps, ProFormProps } from "@ant-design/pro-components";

export default BaseForm;
