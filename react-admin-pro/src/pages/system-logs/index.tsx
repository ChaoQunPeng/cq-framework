import { history, useAccess } from '@umijs/max';
import { useEffect } from 'react';

/** 系统日志入口优先展示可访问的操作日志，否则进入登录日志。 */
export default function SystemLogsRedirect() {
  const access = useAccess();

  useEffect(() => {
    history.replace(
      access.canReadOperationLog
        ? '/system-logs/operations'
        : '/system-logs/logins',
    );
  }, [access.canReadOperationLog]);

  return null;
}
