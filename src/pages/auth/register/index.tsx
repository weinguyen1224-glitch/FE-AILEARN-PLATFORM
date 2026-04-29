import { Footer } from "@/common/components";
import { authService } from "@/modules/auth/service/auth.service";
import { LockOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Link, history } from "@umijs/max";
import { App, Button, Result } from "antd";
import { createStyles } from "antd-style";
import React, { useState } from "react";

const useStyles = createStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "auto",
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: "100% 100%",
  },
}));

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { styles } = useStyles();
  const { message } = App.useApp();
  const [form] = ProForm.useForm();

  const handleSubmit = async (values: {
    username: string;
    password: string;
    hoTen: string;
    soDienThoai: string;
    email?: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    const { confirmPassword, ...registerData } = values;

    setLoading(true);
    try {
      await authService.register(registerData);
      setRegisterSuccess(true);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (value && value !== form.getFieldValue("password")) {
      return Promise.reject("Mật khẩu xác nhận không khớp!");
    }
    return Promise.resolve();
  };

  if (registerSuccess) {
    return (
      <div className={styles.container}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          <Result
            status="success"
            title="Đăng ký thành công!"
            subTitle="Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục."
            extra={[
              <Button
                type="primary"
                key="login"
                size="large"
                onClick={() => history.push("/auth/login")}
              >
                Đăng nhập ngay
              </Button>,
              <Link to="/auth/login" key="back">
                <Button size="large">Quay lại đăng nhập</Button>
              </Link>,
            ]}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div
        style={{
          flex: "1",
          padding: "32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "32px 40px",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: 440,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src="/logo.svg" alt="logo" style={{ height: 44 }} />
            <h2 style={{ marginTop: 16, fontSize: 24, fontWeight: 600 }}>
              Đăng ký tài khoản
            </h2>
            <p style={{ color: "#666", marginTop: 8 }}>
              Tạo tài khoản mới để trải nghiệm nền tảng học tập
            </p>
          </div>

          <ProForm
            form={form}
            onFinish={handleSubmit}
            submitter={{
              searchConfig: {
                submitText: "Đăng ký",
              },
              submitButtonProps: {
                loading,
                size: "large",
                block: true,
              },
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: <UserOutlined />,
                placeholder: "Tên đăng nhập",
              }}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập!",
                },
              ]}
            />

            <ProFormText
              name="hoTen"
              fieldProps={{
                size: "large",
                prefix: <UserOutlined />,
                placeholder: "Họ và tên",
              }}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ tên!",
                },
              ]}
            />

            <ProFormText
              name="soDienThoai"
              fieldProps={{
                size: "large",
                prefix: <PhoneOutlined />,
                placeholder: "Số điện thoại",
              }}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại!",
                },
                {
                  pattern: /^(\+84|0)\d{9}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            />

            <ProFormText
              name="email"
              fieldProps={{
                size: "large",
                placeholder: "Email (tùy chọn)",
              }}
              rules={[
                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            />

            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined />,
                placeholder: "Mật khẩu (ít nhất 6 ký tự)",
              }}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
            />

            <ProFormText.Password
              name="confirmPassword"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined />,
                placeholder: "Xác nhận mật khẩu",
              }}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
                {
                  validator: validateConfirmPassword,
                },
              ]}
            />
          </ProForm>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <span>Đã có tài khoản? </span>
            <Link to="/auth/login">
              <span style={{ color: "#1890ff" }}>Đăng nhập ngay</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
