/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: "/welcome",
    name: "welcome",
    icon: "smile",
    component: "./Welcome",
  },
  {
    path: "/admin",
    name: "admin",
    icon: "crown",
    access: "canAdmin",
    routes: [
      {
        path: "/admin",
        redirect: "/admin/sub-page",
      },
      {
        path: "/admin/sub-page",
        name: "sub-page",
        component: "./Admin",
      },
    ],
  },
  {
    path: "/dashboard",
    name: "dashboard",
    icon: "dashboard",
    routes: [
      {
        path: "/dashboard",
        redirect: "/dashboard/analysis",
      },

      {
        name: "analysis",
        icon: "smile",
        path: "/dashboard/analysis",
        component: "@/pages/dashboard/analysis",
      },
      {
        name: "monitor",
        icon: "smile",
        path: "/dashboard/monitor",
        component: "@/pages/dashboard/monitor",
      },
      {
        name: "workplace",
        icon: "smile",
        path: "/dashboard/workplace",
        component: "@/pages/dashboard/workplace",
      },
    ],
  },
  {
    path: "/form",
    icon: "form",
    name: "form",
    routes: [
      {
        path: "/form",
        redirect: "/form/basic-form",
      },
      {
        name: "basic-form",
        icon: "smile",
        path: "/form/basic-form",
        component: "@/pages/form/basic-form",
      },
      {
        name: "step-form",
        icon: "smile",
        path: "/form/step-form",
        component: "@/pages/form/step-form",
      },
      {
        name: "advanced-form",
        icon: "smile",
        path: "/form/advanced-form",
        component: "@/pages/form/advanced-form",
      },
    ],
  },
  {
    path: "/list",
    icon: "table",
    name: "list",
    routes: [
      {
        path: "/list/search",
        name: "search-list",
        component: "@/pages/list/search",
        routes: [
          {
            path: "/list/search",
            redirect: "/list/search/articles",
          },
          {
            name: "articles",
            icon: "smile",
            path: "/list/search/articles",
            component: "@/pages/list/search/articles",
          },
          {
            name: "projects",
            icon: "smile",
            path: "/list/search/projects",
            component: "@/pages/list/search/projects",
          },
          {
            name: "applications",
            icon: "smile",
            path: "/list/search/applications",
            component: "@/pages/list/search/applications",
          },
        ],
      },
      {
        path: "/list",
        redirect: "/list/table-list",
      },
      {
        name: "table-list",
        icon: "smile",
        path: "/list/table-list",
        component: "@/pages/table",
      },
      {
        name: "basic-list",
        icon: "smile",
        path: "/list/basic-list",
        component: "@/pages/list/basic-list",
      },
      {
        name: "card-list",
        icon: "smile",
        path: "/list/card-list",
        component: "@/pages/list/card-list",
      },
    ],
  },
  {
    path: "/profile",
    name: "profile",
    icon: "profile",
    routes: [
      {
        path: "/profile",
        redirect: "/profile/basic",
      },
      {
        name: "basic",
        icon: "smile",
        path: "/profile/basic",
        component: "@/pages/profile/basic",
      },
      {
        name: "advanced",
        icon: "smile",
        path: "/profile/advanced",
        component: "@/pages/profile/advanced",
      },
    ],
  },
  {
    name: "result",
    icon: "CheckCircleOutlined",
    path: "/result",
    routes: [
      {
        path: "/result",
        redirect: "/result/success",
      },
      {
        name: "success",
        icon: "smile",
        path: "/result/success",
        component: "@/pages/result/success",
      },
      {
        name: "fail",
        icon: "smile",
        path: "/result/fail",
        component: "@/pages/result/fail",
      },
    ],
  },

  {
    name: "exception",
    icon: "warning",
    path: "/exception",
    routes: [
      {
        path: "/exception",
        redirect: "/exception/403",
      },
      {
        name: "403",
        icon: "smile",
        path: "/exception/403",
        component: "@/pages/exception/403",
      },
      {
        name: "404",
        icon: "smile",
        path: "/exception/404",
        component: "@/pages/exception/404",
      },
      {
        name: "500",
        icon: "smile",
        path: "/exception/500",
        component: "@/pages/exception/500",
      },
    ],
  },
  {
    name: "account",
    icon: "user",
    path: "/account",
    routes: [
      {
        path: "/account",
        redirect: "/account/center",
      },
      {
        name: "center",
        icon: "smile",
        path: "/account/center",
        component: "@/pages/account/center",
      },
      {
        name: "settings",
        icon: "smile",
        path: "/account/settings",
        component: "@/pages/account/settings",
      },
    ],
  },
  {
    path: "/user",
    name: "user",
    icon: "table",
    component: "@/pages/user",
  },
  {
    path: "/",
    redirect: "/dashboard/analysis",
  },

  {
    component: "404",
    path: "./*",
  },
];
