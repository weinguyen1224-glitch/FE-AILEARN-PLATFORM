export default [
  {
    path: "/welcome",
    name: "welcome",
    icon: "smile",
    component: "./Welcome",
  },
  // Auth routes - không dùng layout chính
  {
    path: "/auth/login",
    component: "@/pages/auth/login",
    layout: false,
  },
  {
    path: "/auth/register",
    component: "@/pages/auth/register",
    layout: false,
  },
  {
    path: "/auth/register-result",
    component: "@/pages/auth/register-result",
    layout: false,
  },
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    component: "404",
    path: "./*",
  }];
