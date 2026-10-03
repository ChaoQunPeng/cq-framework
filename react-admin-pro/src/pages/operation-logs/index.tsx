import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  getOperationLogs,
  type OperationLogItem,
  type OperationLogQuery,
} from './service';

/** 操作日志只读列表，按操作者和动作筛选用户、角色写操作。 */
export default function OperationLogs() {
  const { formatMessage } = useIntl();
  /** 日志列和动作名称使用页面词条，语言切换后与菜单保持一致。 */
  const t = (id: string, defaultMessage: string) =>
    formatMessage({ id: `pages.logs.${id}`, defaultMessage });

  const columns: ProColumns<OperationLogItem>[] = [
    { title: t('operator', '操作者'), dataIndex: 'operatorName', width: 130 },
    {
      title: t('action', '操作类型'),
      dataIndex: 'action',
      valueType: 'select',
      valueEnum: {
        'user:create': t('userCreate', '新增用户'),
        'user:update': t('userUpdate', '修改用户'),
        'user:status': t('userStatus', '修改用户状态'),
        'user:delete': t('userDelete', '删除用户'),
        'role:create': t('roleCreate', '新增角色'),
        'role:update': t('roleUpdate', '修改角色'),
        'role:delete': t('roleDelete', '删除角色'),
        'file:upload': t('fileUpload', '上传图片'),
      },
      width: 150,
    },
    {
      title: t('targetId', '目标 ID'),
      dataIndex: 'targetId',
      search: false,
      ellipsis: true,
      width: 220,
    },
    {
      title: t('path', '请求路径'),
      dataIndex: 'path',
      search: false,
      ellipsis: true,
      width: 250,
    },
    { title: t('ip', 'IP 地址'), dataIndex: 'ip', search: false, width: 150 },
    {
      title: t('userAgent', '浏览器信息'),
      dataIndex: 'userAgent',
      search: false,
      ellipsis: true,
      width: 220,
    },
    {
      title: t('operationTime', '操作时间'),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<OperationLogItem, OperationLogQuery>
        headerTitle={t('operationTitle', '操作日志')}
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
