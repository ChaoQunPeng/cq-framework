import axios, { type AxiosRequestConfig } from 'axios'

/** 后台接口统一使用的 Axios 实例，接口地址由 Vite 环境变量配置。 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

/**
 * 发起后台接口请求并返回响应数据。
 * 泛型由具体业务接口声明，避免页面重复读取 AxiosResponse.data。
 */
export async function request<ResponseData>(
  config: AxiosRequestConfig
): Promise<ResponseData> {
  const response = await httpClient.request<ResponseData>(config)

  return response.data
}
