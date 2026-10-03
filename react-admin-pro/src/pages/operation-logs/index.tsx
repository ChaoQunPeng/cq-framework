import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  getOperationLogs,
  type OperationLogItem,
  type OperationLogQuery,
} from './service';

/** 操作日志只读列表，按操作者和动作筛选用户、角色写操作。 */
export default function OperationLogs() {
  const columns: ProColumns<OperationLogItem>[] = [
    { title: '操作者', dataIndex: 'operatorName', width: 130 },
    {
      title: '操作类型',
      dataIndex: 'action',
      valueType: 'select',
      valueEnum: {
        'user:create': '新增用户',
        'user:update': '修改用户',
        'user:status': '修改用户状态',
        'user:delete': '删除用户',
        'role:create': '新增角色',
        'role:update': '修改角色',
        'role:delete': '删除角色',
        'file:upload': '上传图片',
      },
      width: 150,
    },
    { title: '业务说明', dataIndex: 'description', search: false, width: 150 },
    {
      title: '目标 ID',
      dataIndex: 'targetId',
      search: false,
      ellipsis: true,
      width: 220,
    },
    {
      title: '请求路径',
      dataIndex: 'path',
      search: false,
      ellipsis: true,
      width: 250,
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
      title: '操作时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<OperationLogItem, OperationLogQuery>
        headerTitle="操作日志"
        rowKey="_id"
        columns={columns}
        request={getOperationLogs}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 'max-content' }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
    </PageContainer>
  );
}
