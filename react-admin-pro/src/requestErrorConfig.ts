import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getIntl, history } from '@umijs/max';
import { message } from 'antd';
import type { ApiResponse } from '@/services/api';
import { clearAuthSession, getAccessToken } from '@/utils/auth';

const API_SUCCESS_CODE = 1;

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { code, msg, data } = res as unknown as ApiResponse<unknown>;
      // HTTP 200 下的业务失败也按统一 code 交给全局错误处理器展示。
      if (code !== API_SUCCESS_CODE) {
        const error: any = new Error(msg);
        error.name = 'BizError';
        error.info = { code, msg, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 后台账号失效或 Token 无效时清理本地会话，并保留重新登录后的回跳地址。
      const responseCode =
        error.name === 'BizError'
          ? error.info?.code
          : error.response?.status;
      if (responseCode === 401) {
        clearAuthSession();
        const { pathname, search, hash } = history.location;
        if (pathname !== '/user/login') {
          history.replace(
            `/user/login?redirect=${encodeURIComponent(pathname + search + hash)}`,
          );
        }
      }
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo = error.info as ApiResponse<unknown>;
        message.error(errorInfo.msg);
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const responseData = error.response.data as ApiResponse<unknown>;
        message.error(
          `${error.response.status} ${responseData.msg ?? 'Unknown error'}`,
        );
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        message.error(
          getIntl().formatMessage({
            id: 'app.request.offline',
            defaultMessage:
              'Network unavailable. Please check your connection and try again.',
          }),
        );
      } else if (error.request) {
        message.error('None response! Please retry.');
      } else {
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 登录接口执行前没有 Token，其余请求统一携带当前会话的 Bearer Token。
      const token = getAccessToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],

  // 响应拦截器：业务接口统一是 HTTP 200 + body.code（成功为 1，失败为 0，登录态失效为 401）。
  // 在 axios 链路内按业务 code 抛 BizError，让全局 errorHandler 统一提示并处理登录态失效；
  // errorThrower 只对 useRequest 生效，普通 request() 调用必须依赖这里才能感知业务失败。
  responseInterceptors: [
    (response) => {
      const body = response.data as ApiResponse<unknown>;
      if (body.code !== API_SUCCESS_CODE) {
        const error: any = new Error(body.msg);
        error.name = 'BizError';
        error.info = body;
        throw error;
      }
      return response;
    },
  ],
};
