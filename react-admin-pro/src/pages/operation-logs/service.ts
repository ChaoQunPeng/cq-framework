import { requestApiData, type PageData } from '@/services/api';

/** 操作日志展示字段；日志不包含请求正文或敏感业务数据。 */
export type OperationLogItem = {
  _id: string;
  operatorId: string;
  operatorName: string;
  action: string;
  description: string;
  targetId?: string;
  path: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
};

export type OperationLogQuery = {
  current?: number;
  pageSize?: number;
  operatorName?: string;
  action?: string;
};

/** 将 ProTable 的 current 转为后端 page 并读取只读日志分页结果。 */
export async function getOperationLogs({
  current,
  ...params
}: OperationLogQuery) {
  const pageData = await requestApiData<PageData<OperationLogItem>>(
    '/api/admin/operation-logs/findLogs',
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
