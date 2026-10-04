# CQ Framework Nest 服务

提供管理员登录、用户与角色管理、权限校验、操作日志、登录日志及需要管理员登录的通用图片上传。

## 本地启动

数据库使用 MongoDB（Mongoose），无需迁移脚本：准备一个可用的 MongoDB（Docker 容器、本地安装均可），在 `.env` 里配好 `MONGODB_URI` 即可。

复制 `.env.example` 为 `.env`，填写 `MONGODB_URI`、`JWT_SECRET` 和 `SEED_ADMIN_PASSWORD`。初始管理员账号由 `SEED_ADMIN_USERNAME` 和 `SEED_ADMIN_PHONE` 指定；seed 只在账号不存在时创建，不会覆盖已有密码。

```bash
npm install
npm run seed
npm run dev
```

服务默认监听 `http://localhost:3000`，Swagger 文档位于 `/api-docs`，供前端生成接口类型的 JSON 文档位于 `/api-docs-json`。

后端启动时会同步系统权限，seed 还会把全部系统权限关联到内置超级管理员角色。运行时，超级管理员也会自动获得代码定义的全部系统权限。普通角色可在后端重启后分配新增权限；操作日志和登录日志只提供查询接口。

需要同时启动 MongoDB 和管理端时，可在仓库根目录使用 `docker compose up --build -d`。Compose 通过名为 `api` 的服务向管理端提供接口，并使用独立卷持久化上传文件。
