import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { FormattedMessage, Helmet, useIntl, useModel } from "@umijs/max";
import { App } from "antd";
import { createStyles } from "antd-style";
import React, { startTransition } from "react";
import { Footer } from "@/components";
import { login, type LoginParams } from "@/services/auth";
import { saveAuthSession } from "@/utils/auth";
import Settings from "../../../../config/defaultSettings";

const defaultAuthenticatedPath = "/welcome";

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allow same-origin relative paths starting with '/'.
 */
const getSafeRedirectUrl = (redirect: string | null): string => {
  if (!redirect?.startsWith("/")) return defaultAuthenticatedPath;

  if (redirect.startsWith("//")) return defaultAuthenticatedPath;

  try {
    const parsed = new URL(redirect, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return defaultAuthenticatedPath;
    }
    // 403 是授权失败结果页，登录成功后应回到所有账号均可访问的欢迎页。
    if (parsed.pathname === "/exception/403") {
      return defaultAuthenticatedPath;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return defaultAuthenticatedPath;
  }
};

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "auto",
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: "100% 100%",

      "& .ant-pro-form-login-title": {
        insetBlockStart: "auto",
        fontSize: 30,
      },
    },
  };
});

const Login: React.FC = () => {
  const { setInitialState } = useModel("@@initialState");
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  /** 提交账号密码，保存后端签发的 Token 并建立前端用户会话。 */
  const handleSubmit = async (values: LoginParams) => {
    try {
      const loginResponse = await login(values);
      const currentUser = saveAuthSession(loginResponse);
      startTransition(() => {
        setInitialState((state) => ({
          ...state,
          currentUser,
        }));
      });
      const defaultLoginSuccessMessage = intl.formatMessage({
        id: "pages.login.success",
        defaultMessage: "登录成功！",
      });
      message.success(defaultLoginSuccessMessage);
      const urlParams = new URL(window.location.href).searchParams;
      const redirectUrl = getSafeRedirectUrl(urlParams.get("redirect"));
      window.location.href = redirectUrl;
    } catch {
      // 登录请求失败由全局请求处理器展示后端错误，这里只阻止继续建立会话。
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: "menu.login",
            defaultMessage: "登录页",
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <div
        style={{
          flex: "1",
          padding: "120px 0 32px 0",
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: "75vw",
          }}
          logo={<img alt="CQ Framework" src="/logo.svg" width={44} height={44} />}
          title="后台管理"
          subTitle={" "}
          initialValues={{
            autoLogin: true,
          }}
          actions={[]}
          onFinish={async (values) => {
            await handleSubmit(values as LoginParams);
          }}
        >
          <ProFormText
            name="account"
            fieldProps={{
              size: "large",
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: "pages.login.username.placeholder",
              defaultMessage: "用户名或手机号",
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名或手机号!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: "large",
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: "pages.login.password.placeholder",
              defaultMessage: "密码:",
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
