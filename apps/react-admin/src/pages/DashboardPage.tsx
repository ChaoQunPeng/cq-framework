import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Button, Card, Col, List, Progress, Row, Statistic, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'

const activities = [
  {
    icon: <UserOutlined />,
    color: '#1677ff',
    text: '新增用户「陈晨」完成账号注册',
    time: '10 分钟前'
  },
  {
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    text: '订单 #20260730018 已完成审核',
    time: '35 分钟前'
  },
  {
    icon: <FileTextOutlined />,
    color: '#fa8c16',
    text: '月度运营报告已生成',
    time: '2 小时前'
  },
  {
    icon: <ClockCircleOutlined />,
    color: '#722ed1',
    text: '系统将在今晚 02:00 执行数据备份',
    time: '今天 09:20'
  }
]

function DashboardPage() {
  const navigate = useNavigate()

  return (
    <>
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-main">
          <Avatar size={52} icon={<UserOutlined />} />
          <div>
            <h2>早上好，管理员</h2>
            <p>今天有 12 项业务待处理，祝你工作顺利。</p>
          </div>
        </div>
        <Button type="primary" icon={<TeamOutlined />} onClick={() => navigate('/users')}>
          用户管理
        </Button>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="用户总数" value={8462} prefix={<TeamOutlined />} />
            <div className="metric-trend">
              <strong>+12.5%</strong>较上月
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="今日订单" value={286} prefix={<ShoppingCartOutlined />} />
            <div className="metric-trend">
              <strong>+8.2%</strong>较昨日
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="待处理事项" value={12} suffix="项" />
            <div className="metric-trend">
              <Tag color="warning">需要关注</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="本月收入" value={126580} prefix="¥" />
            <div className="metric-trend">
              <strong>+18.6%</strong>较上月
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="dashboard-row" gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="panel-card" title="业务进度">
            <div className="progress-row">
              <div className="progress-label">
                <span>月度销售目标</span>
                <span>¥ 760,000 / ¥ 1,000,000</span>
              </div>
              <Progress percent={76} strokeColor="#1677ff" />
            </div>
            <div className="progress-row">
              <div className="progress-label">
                <span>新用户增长</span>
                <span>1,240 / 2,000</span>
              </div>
              <Progress percent={62} strokeColor="#52c41a" />
            </div>
            <div className="progress-row">
              <div className="progress-label">
                <span>服务工单处理</span>
                <span>892 / 1,000</span>
              </div>
              <Progress percent={89} strokeColor="#fa8c16" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="panel-card" title="最近动态">
            <List
              dataSource={activities}
              renderItem={item => (
                <List.Item>
                  <div className="activity-item">
                    <Avatar size={34} icon={item.icon} style={{ backgroundColor: item.color }} />
                    <div className="activity-copy">
                      <p>{item.text}</p>
                      <time>{item.time}</time>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default DashboardPage
