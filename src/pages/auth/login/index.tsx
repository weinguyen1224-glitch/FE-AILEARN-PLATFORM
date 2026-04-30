import { Footer } from "@/common/components";
import {
  LOCALSTORAGE_ACCESS_EXPIRE_AT,
  LOCALSTORAGE_ACCESS_TOKEN_KEY,
} from "@/config/constant/local-storage";
import { useLogin } from "@/modules/auth/hooks/auth.hooks";
import type { AuthResponse, LoginDto } from "@/modules/auth/types/auth.types";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { Link } from "@umijs/max";
import { App } from "antd";
import { createStyles } from "antd-style";
import React from "react";

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

const LoginPage: React.FC = () => {
  const { styles } = useStyles();
  const { message } = App.useApp();
  const { run: login, loading } = useLogin();

  const handleSubmit = async (values: LoginDto) => {
    try {
      const result = await login(values) as AuthResponse;
      if (result?.accessToken) {
        localStorage.setItem(LOCALSTORAGE_ACCESS_TOKEN_KEY, result.accessToken);
        localStorage.setItem(LOCALSTORAGE_ACCESS_EXPIRE_AT, String(result.accessExpireAt));
        message.success("Đăng nhập thành công!");
        const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/";
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

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
        <LoginForm
          contentStyle={{ minWidth: 320, maxWidth: 400 }}
          logo={<img alt="logo" src="/logo.svg" style={{ height: 44 }} />}
          title="AILEARN PLATFORM"
          subTitle="Nền tảng học tập trực tuyến"
          onFinish={handleSubmit}
          submitter={{
            searchConfig: { submitText: "Đăng nhập" },
            submitButtonProps: { loading, size: "large" },
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{ size: "large", prefix: <UserOutlined />, placeholder: "Tên đăng nhập" }}
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{ size: "large", prefix: <LockOutlined />, placeholder: "Mật khẩu" }}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          />
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <span>Chưa có tài khoản? </span>
            <Link to="/auth/register">
              <span style={{ color: "#1890ff" }}>Đăng ký ngay</span>
            </Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
