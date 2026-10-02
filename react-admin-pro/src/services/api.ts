import type { RequestOptions } from '@@/plugin-request/request';
import { request } from '@umijs/max';

/** Nest JSON 业务接口统一返回结构，data 保留调用方声明的具体业务类型。 */
export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

/** 用户、角色等分页查询共用的业务数据结构。 */
export type PageData<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * 请求 Nest 业务接口并统一解出 data，使页面和表单只依赖自己的业务数据类型。
 */
export async function requestApiData<T>(
  url: string,
  options: RequestOptions,
): Promise<T> {
  const response = await request<ApiResponse<T>>(url, options);
  return response.data;
}
