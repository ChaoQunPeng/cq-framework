import { requestApiData, type PageData } from '@/services/api';

/** 登录日志展示字段；失败登录可能没有对应管理员 ID。 */
export type LoginLogItem = {
  _id: string;
  account: string;
  userId?: string;
  status: 'success' | 'failure';
  reason?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
};

export type LoginLogQuery = {
  current?: number;
  pageSize?: number;
  account?: string;
  status?: LoginLogItem['status'];
};

/** 将 ProTable 分页参数转为登录日志查询接口使用的 page。 */
export async function getLoginLogs({ current, ...params }: LoginLogQuery) {
  const pageData = await requestApiData<PageData<LoginLogItem>>(
    '/api/admin/login-logs/findLogs',
    { method: 'POST', data: { ...params, page: current } },
  );
  return {
    data: pageData.list,
    total: pageData.total,
    success: true,
    current: pageData.page,
    pageSize: pageData.pageSize,
  };
}
