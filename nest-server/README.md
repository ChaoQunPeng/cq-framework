# CQ Framework Nest 服务

提供管理员登录、用户与角色管理、权限校验及需要管理员登录的通用图片上传。

## 本地启动

复制 `.env.example` 为 `.env`，填写 `MONGODB_URI`、`JWT_SECRET` 和 `SEED_ADMIN_PASSWORD`。初始管理员账号由 `SEED_ADMIN_USERNAME` 和 `SEED_ADMIN_PHONE` 指定；seed 只在账号不存在时创建，不会覆盖已有密码。

```bash
npm install
npm run seed
npm run dev
```

服务默认监听 `http://localhost:3000`，Swagger 文档位于 `/api-docs`，供前端生成接口类型的 JSON 文档位于 `/api-docs-json`。

需要同时启动 MongoDB 和管理端时，可在仓库根目录使用 `docker compose up --build -d`。Compose 通过名为 `api` 的服务向管理端提供接口，并使用独立卷持久化上传文件。
