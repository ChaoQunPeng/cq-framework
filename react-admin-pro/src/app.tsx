import { LinkOutlined } from "@ant-design/icons";
import type {
  ProLayoutProps,
  Settings as LayoutSettings,
} from "@ant-design/pro-components";
import { SettingDrawer } from "@ant-design/pro-components";
import type { RequestConfig, RunTimeLayoutConfig } from "@umijs/max";
import { history, Link } from "@umijs/max";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

// Initialize dayjs plugins globally
dayjs.extend(relativeTime);

import {
  AvatarDropdown,
  DocLink,
  ErrorBoundary,
  Footer,
  LangDropdown,
  OfflineBanner,
  VersionDropdown,
} from "@/components";
import { getCurrentUser } from "@/services/auth";
import { getStoredCurrentUser } from "@/utils/auth";
import defaultSettings from "../config/defaultSettings";
import { errorConfig } from "./requestErrorConfig";

const isDev = process.env.NODE_ENV === "development";
const loginPath = "/user/login";

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  settingDrawerOpen?: boolean;
}> {
  /** 从登录成功时保存的会话中恢复布局和权限所需的用户信息。 */
  const fetchUserInfo = async () => {
    const currentUser = getStoredCurrentUser();
    if (!currentUser) {
      const { pathname, search, hash } = history.location;
      history.replace(
        `${loginPath}?redirect=${encodeURIComponent(pathname + search + hash)}`
      );
      return undefined;
    }
    // 用户资料与有效权限统一由服务端实时计算，避免前端自行拼装授权结果。
    // 本地残留的失效 Token 会在 401 时被全局错误处理清理并跳转登录页，
    // 这里捕获失败返回空，避免初始状态加载中断导致应用启动异常。
    try {
      const currentUserResponse = await getCurrentUser();
      return {
        userid: currentUserResponse.id,
        name: currentUserResponse.username,
        phone: currentUserResponse.phone,
        roleCodes: currentUserResponse.roleCodes,
        permissionCodes: currentUserResponse.permissionCodes,
      };
    } catch {
      return undefined;
    }
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (
    ![loginPath, "/user/register", "/user/register-result"].includes(
      location.pathname
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
      settingDrawerOpen: false,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
    settingDrawerOpen: false,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  // ProSettings 未声明 token，运行时 token 由 defaultSettings 提供，这里按 ProLayout 的类型读取。
  const settingsToken = (
    initialState?.settings as { token?: ProLayoutProps["token"] } | undefined
  )?.token;

  return {
    menuItemRender: (item, dom) => {
      if (item.path) {
        return (
          <Link to={item.path} prefetch>
            {dom}
          </Link>
        );
      }
      return dom;
    },
    actionsRender: () => {
      // `locale: false` opts out of the language switcher. ProLayout's own
      // `locale` prop is a locale string, so narrow to the boolean toggle here.
      const localeEnabled =
        (initialState?.settings as { locale?: boolean })?.locale !== false;
      return [
        // <DocLink key="doc" />,
        // <VersionDropdown key="version" />,
        // localeEnabled && <LangDropdown key="lang" />,
      ].filter(Boolean);
    },
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: "ProUser",
      render: (_, avatarChildren) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.replace(
          `${loginPath}?redirect=${encodeURIComponent(
            location.pathname + location.search + location.hash
          )}`
        );
      }
    },
    // bgLayoutImgList: [
    //   {
    //     src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr",
    //     left: 85,
    //     bottom: 100,
    //     height: "303px",
    //   },
    //   {
    //     src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr",
    //     bottom: -68,
    //     right: -45,
    //     height: "303px",
    //   },
    //   {
    //     src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr",
    //     bottom: 0,
    //     left: 0,
    //     width: "331px",
    //   },
    // ],
    // links: isDev
    //   ? [
    //       <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //     ]
    //   : [],
    // Replace ProLayout's default ErrorBoundary with our offline-aware version,
    // so chunk load errors show friendly messages instead of "Something went wrong."
    ErrorBoundary,
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            collapse={initialState?.settingDrawerOpen}
            onCollapseChange={(open) => {
              setInitialState((s) => ({
                ...s,
                settingDrawerOpen: open,
              }));
            }}
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((s) => ({
                ...s,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
    // SettingDrawer 会把 settings.token 一并合并进来，故在其后覆盖页面底色与留白。
    token: {
      ...settingsToken,
      // ProLayout 默认是「白到灰」的渐变背景，这里统一成纯色底，页面不再出现灰底。
      // bgLayout:
      //   initialState?.settings?.navTheme === "realDark" ? "#141414" : "#ffffff",
      pageContainer: {
        ...settingsToken?.pageContainer,
        // 内容区自带 40px 左右留白，收紧到 16px 让页面更紧凑。
        paddingInlinePageContainerContent: 16,
        paddingBlockPageContainerContent: 16,
      },
    },
    // SettingDrawer 初始化时会移除 menu 配置，此处在最终合并后固定关闭菜单自动收起。
    menu: {
      ...initialState?.settings?.menu,
      autoClose: false,
    },
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  ...errorConfig,
};

export function rootContainer(container: React.ReactNode) {
  return (
    <>
      <OfflineBanner />
      <ErrorBoundary>{container}</ErrorBoundary>
    </>
  );
}
