import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { getLoginLogs, type LoginLogItem, type LoginLogQuery } from './service';

/** 登录日志只读列表，展示账号密码登录成功与失败的审计记录。 */
export default function LoginLogs() {
  const columns: ProColumns<LoginLogItem>[] = [
    { title: '登录账号', dataIndex: 'account', width: 180 },
    {
      title: '登录结果',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        success: { text: '成功', status: 'Success' },
        failure: { text: '失败', status: 'Error' },
      },
      width: 110,
    },
    {
      title: '失败原因',
      dataIndex: 'reason',
      search: false,
      ellipsis: true,
      width: 180,
    },
    {
      title: '用户 ID',
      dataIndex: 'userId',
      search: false,
      ellipsis: true,
      width: 220,
    },
    { title: 'IP 地址', dataIndex: 'ip', search: false, width: 150 },
    {
      title: '浏览器信息',
      dataIndex: 'userAgent',
      search: false,
      ellipsis: true,
      width: 220,
    },
    {
      title: '登录时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<LoginLogItem, LoginLogQuery>
        headerTitle="登录日志"
        rowKey="_id"
        columns={columns}
        request={getLoginLogs}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 'max-content' }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
    </PageContainer>
  );
}
