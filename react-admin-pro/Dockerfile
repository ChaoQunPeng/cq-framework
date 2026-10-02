FROM docker.m.daocloud.io/library/node:22 AS build

WORKDIR /app

# 先复制依赖清单，业务源码变化时可以复用 Docker 依赖安装缓存。
COPY package.json package-lock.json .npmrc ./

# 按锁文件安装 Linux 容器所需的依赖和可选原生模块，保证构建结果可复现。
RUN npm ci --include=optional --registry=https://registry.npmmirror.com

# 复制 Umi 项目源码并构建 Nginx 可托管的静态资源。
COPY . .
RUN npm run build


FROM docker.m.daocloud.io/library/nginx:1.27-alpine

# Nginx 负责前端路由回退，并将现有业务接口转发给 Compose 中的 API 服务。
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
