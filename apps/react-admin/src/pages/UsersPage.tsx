import { UserOutlined } from '@ant-design/icons'
import { Avatar, Card, Input, Select, Space, Table, Tag } from 'antd'
import type { TableProps } from 'antd'
import { useMemo, useState } from 'react'

type UserRecord = {
  key: string
  name: string
  account: string
  role: string
  status: '启用' | '停用'
  lastActive: string
}

const users: UserRecord[] = [
  {
    key: '1',
    name: '陈晨',
    account: 'chenchen',
    role: '管理员',
    status: '启用',
    lastActive: '2026-07-30 10:24',
  },
  {
    key: '2',
    name: '李明',
    account: 'liming',
    role: '运营人员',
    status: '启用',
    lastActive: '2026-07-30 09:18',
  },
  {
    key: '3',
    name: '王芳',
    account: 'wangfang',
    role: '访客',
    status: '停用',
    lastActive: '2026-07-25 16:42',
  },
  {
    key: '4',
    name: '周扬',
    account: 'zhouyang',
    role: '运营人员',
    status: '启用',
    lastActive: '2026-07-29 18:06',
  },
]

const columns: TableProps<UserRecord>['columns'] = [
  {
    title: '用户',
    dataIndex: 'name',
    render: (name, record) => (
      <Space>
        <Avatar size="small" icon={<UserOutlined />} />
        <div>
          <div>{name}</div>
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            {record.account}
          </span>
        </div>
      </Space>
    ),
  },
  { title: '角色', dataIndex: 'role' },
  {
    title: '状态',
    dataIndex: 'status',
    render: (status: UserRecord['status']) => (
      <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
    ),
  },
  { title: '最近活跃', dataIndex: 'lastActive' },
]

function UsersPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.account.toLowerCase().includes(keyword)
      const matchesStatus =
        status === 'all' ||
        (status === 'enabled' && user.status === '启用') ||
        (status === 'disabled' && user.status === '停用')

      return matchesKeyword && matchesStatus
    })
  }, [query, status])

  return (
    <Card>
      <div className="table-toolbar">
        <div className="table-filters">
          <Input.Search
            placeholder="搜索用户"
            allowClear
            style={{ width: 240 }}
            onSearch={setQuery}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            defaultValue="all"
            style={{ width: 140 }}
            onChange={setStatus}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'enabled', label: '启用' },
              { value: 'disabled', label: '停用' },
            ]}
          />
        </div>
      </div>
      <Table<UserRecord>
        columns={columns}
        dataSource={filteredUsers}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 5, showTotal: (total) => `共 ${total} 条` }}
      />
    </Card>
  )
}

export default UsersPage
