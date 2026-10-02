/**
 * 所有 Nest JSON 业务接口共用的响应结构。
 * data 使用泛型保留具体业务类型，可以承载对象、数组、字符串、数字或分页数据。
 */
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
