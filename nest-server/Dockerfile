FROM docker.m.daocloud.io/library/node:22

WORKDIR /app

# 依赖清单独立复制，业务源码变化时可复用依赖安装层。
COPY package.json package-lock.json ./

RUN npm ci --registry=https://registry.npmmirror.com

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
