# cq-framework

通用管理框架套件，包含 NestJS 后端和 React Admin 管理端。两个应用分别使用 npm 管理依赖。

## 目录

```text
cq-framework/
├── nest-server/       # 后端：管理员认证、权限、用户、角色与通用上传
├── react-admin-pro/   # 管理端：登录、用户管理与角色管理
├── docs/              # 设计文档
└── README.md
```

## 本地开发

```bash
cd nest-server
cp .env.example .env
# 编辑 .env，设置 JWT_SECRET 和 SEED_ADMIN_PASSWORD，并确认 MongoDB 地址可用。
npm install
npm run seed
npm run dev
```

管理端在另一个终端启动：

```bash
cd react-admin-pro
npm install
npm run dev
```

后端默认监听 `http://localhost:3000`，管理端默认监听 `http://localhost:8000`。运行 seed 前需在 `nest-server/.env` 中配置可用的 MongoDB 连接与 JWT 密钥。管理端开发代理配置位于 `react-admin-pro/config/proxy.ts`。

管理端依赖要求 Node.js 22.22.1 或更高版本。只有超级管理员可以创建管理员、分配用户角色和维护角色权限；普通管理员可按已授权的操作维护非超级管理员账号。通用图片上传接口要求有效的管理员登录态。

## Docker 本地运行

先按上面的说明创建 `nest-server/.env`，填写独立的 JWT 密钥和初始管理员密码。Compose 会启动 MongoDB 副本集、Nest 服务和 Nginx 管理端；容器内的 MongoDB 地址由 `compose.yml` 设置。

```bash
docker compose up --build -d
docker compose run --rm api npm run seed
```

管理端访问 `http://localhost:8000`，后端接口文档访问 `http://localhost:3000/api-docs`。Nginx 通过 Compose 服务名 `api` 转发接口和上传资源。MongoDB 数据保存在 `mongo-data` 卷，上传文件保存在 `uploads-data` 卷，重建容器不会删除它们。

首次 seed 只创建尚不存在的管理员账号，不会覆盖已有密码。生产环境应单独配置数据库认证、外部访问地址及密钥；此 Compose 配置用于本地开发。
