# cq-framework

通用管理框架套件，包含 NestJS 后端和 React Admin 管理端。两个应用分别使用 npm 管理依赖。

## 目录

```text
cq-framework/
├── nest-server/       # 后端：认证、权限、用户、角色、系统日志与通用上传
├── react-admin-pro/   # 管理端：登录、用户、角色与系统日志页面
└── README.md
```

## 本地开发

数据库使用 MongoDB（Mongoose），无需迁移脚本：准备一个可用的 MongoDB（Docker 容器、本地安装均可），在 `.env` 里配好 `MONGODB_URI`，再执行一次 seed 即可。

```bash
cp .env.example .env
# 编辑根目录 .env，配置 MONGODB_URI、JWT_SECRET 和 SEED_ADMIN_PASSWORD。

cd nest-server
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

后端默认监听 `http://localhost:3000`，Swagger 文档位于 `/api-docs`，供前端生成接口类型的 JSON 文档位于 `/api-docs-json`。管理端默认监听 `http://localhost:8000`。管理端开发代理配置位于 `react-admin-pro/config/proxy.ts`。

只有超级管理员可以创建管理员、分配用户角色和维护角色权限；普通管理员可按已授权的操作维护非超级管理员账号。通用图片上传接口要求有效的管理员登录态。

系统日志包含操作日志和登录日志，均只提供查询接口。内置超级管理员在运行时拥有全部系统权限；首次启动仍需执行 seed 创建默认账号。以后新增系统权限时，后端启动会自动同步权限数据，供普通角色在角色管理页面分配。

## Docker 本地运行

先按上面的说明在仓库根目录创建 `.env`，填写独立的 JWT 密钥和初始管理员密码。Compose 会启动 MongoDB 副本集、Nest 服务和 Nginx 管理端；容器内的 MongoDB 地址由 `compose.yml` 设置。

```bash
docker compose up --build -d
# 初始化 seed：新建临时容器执行，跑完自动删除
docker compose run --rm api npm run seed
# 或在已在运行的 api 容器内直接执行
docker compose exec api npm run seed
```

管理端访问 `http://localhost:8000`，后端接口文档访问 `http://localhost:3000/api-docs`。MongoDB 数据保存在 `mongo-data` 卷，上传文件保存在 `uploads-data` 卷，重建容器不会删除它们。

初始管理员账号由 `.env` 的 `SEED_ADMIN_USERNAME` 和 `SEED_ADMIN_PHONE` 指定；首次 seed 只创建尚不存在的管理员账号，不会覆盖已有密码。生产环境应单独配置数据库认证、外部访问地址及密钥；此 Compose 配置用于本地开发。

### 镜像构建

项目包含两个业务镜像，均由各自目录下的 Dockerfile 构建：

- `api`（`nest-server/Dockerfile`）：Node 22 单阶段构建，`npm ci` 安装依赖后 `npm run build`，最终运行 `dist/main.js`
- `admin`（`react-admin-pro/Dockerfile`）：两阶段构建，Node 22 打包静态资源，Nginx 托管静态文件并反代 API

常规方式由 Compose 自动构建并启动（`docker compose up --build -d`）；只构建镜像不启动可执行 `docker compose build`。需要脱离 Compose 单独构建时：

```bash
docker build -t cq-framework-api ./nest-server
docker build -t cq-framework-admin ./react-admin-pro
```

### 容器网络

Compose 启动时会自动创建默认网络，`mongo`、`api`、`admin` 三个服务同处一个网络，通过服务名互访，无需手动执行 `docker network create`：

- `api` 通过 `mongodb://mongo:27017/...` 连接数据库，该地址由 `compose.yml` 覆盖根目录 `.env` 中的配置
- `admin` 的 Nginx 将 `/api/admin/`、`/api/common/` 和 `/uploads/` 转发到服务名 `api`（见 `react-admin-pro/nginx.conf`）

admin 与 api 同网络的好处是接口转发全部走容器内网，API 无需对公网暴露端口即可正常工作；当前配置仅把 3000 端口映射到 `127.0.0.1`，供本地访问 Swagger。

### 本机连接 MongoDB

`compose.yml` 将 mongo 的 27017 端口映射到 `127.0.0.1`，仅允许宿主机访问，可用 Compass 等图形客户端调试：

```
mongodb://localhost:27017/?directConnection=true
```

注意必须带 `directConnection=true`：数据库以单节点副本集运行（`--replSet rs0`），副本集成员注册的是容器内部主机名 `mongo:27017`。客户端直连时会被引导去连这个内部地址，而宿主机无法解析它，导致连接失败；`directConnection=true` 跳过副本集发现，始终使用连接串里的地址直连。容器内的 `api` 服务不受此影响，它可以正常解析 `mongo`，因此仍使用 `?replicaSet=rs0` 的标准副本集连接方式。
