import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { getLoginLogs, type LoginLogItem, type LoginLogQuery } from './service';

/** 登录日志只读列表，展示账号密码登录成功与失败的审计记录。 */
export default function LoginLogs() {
  const { formatMessage } = useIntl();
  /** 登录结果、列表标题和搜索标签由同一组双语词条生成。 */
  const t = (id: string, defaultMessage: string) =>
    formatMessage({ id: `pages.logs.${id}`, defaultMessage });

  const columns: ProColumns<LoginLogItem>[] = [
    { title: t('account', '登录账号'), dataIndex: 'account', width: 180 },
    {
      title: t('status', '登录结果'),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        success: { text: t('success', '成功'), status: 'Success' },
        failure: { text: t('failure', '失败'), status: 'Error' },
      },
      width: 110,
    },
    {
      title: t('reason', '失败原因'),
      dataIndex: 'reason',
      search: false,
      ellipsis: true,
      width: 180,
    },
    {
      title: t('userId', '用户 ID'),
      dataIndex: 'userId',
      search: false,
      ellipsis: true,
      width: 220,
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
      title: t('loginTime', '登录时间'),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<LoginLogItem, LoginLogQuery>
        headerTitle={t('loginTitle', '登录日志')}
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
