# 个人开发框架（Framework）规划

## 一、项目目标

打造一套属于自己的开发框架，而不是单纯的脚手架。

希望以后开发任何项目时，都能够：

- 快速创建项目
- 保持统一的项目结构
- 保持统一的开发规范
- 复用成熟的业务模块
- 将精力放在业务开发，而不是重复配置环境

最终目标：

> 只需要选择需要的技术栈，就可以开始开发业务。

---

# 二、开发理念

整个 Framework 遵循几个原则：

## 1、先沉淀，再自动化

不要一开始开发 CLI。

先把各种模板沉淀成熟。

等真正形成稳定的开发流程后，再考虑自动生成。

即：

```
模板
    ↓
完善
    ↓
验证
    ↓
自动化（CLI）
```

CLI 只是最后一步。

---

## 2、按需增加能力

不要一开始集成所有东西。

例如：

- Electron
- SQLite
- MongoDB
- Redis
- Docker

只有真正需要的时候才加入。

---

## 3、按需抽象

只有多个项目都会使用时，才抽离公共模块。

避免过度设计。

---

## 4、持续演进

Framework 不是一次完成。

每完成一个项目，都应该：

- 总结经验
- 更新模板
- 优化目录
- 提炼公共能力

最终形成自己的开发体系。

---

# 三、整体规划

目前计划维护几个基础模板：

```
framework/

├── react-base
├── vue-base
├── nest-api
├── react-admin
└── electron-react（后续）
```

以后可能增加：

```
├── nextjs
├── nuxt
├── mobile
├── fullstack
```

---

# 四、第一阶段：基础模板

目标：

搭建最基础、最干净、可直接使用的项目。

包括：

## React

技术栈：

- React
- TypeScript
- Vite
- pnpm

---

## Vue

技术栈：

- Vue3
- TypeScript
- Vite
- Pinia

---

## NestJS

技术栈：

- NestJS
- TypeScript

---

## React Admin

技术栈：

- React
- Ant Design
- React Router
- TypeScript

先保证：

> 可以直接运行。

---

# 五、第二阶段：补充默认能力

把自己每个项目都会使用的内容提前集成。

例如：

React：

```
React
├── Router
├── Axios
├── TailwindCSS
├── Dayjs
├── Ahooks
├── ESLint
├── Prettier
└── 常用目录结构
```

例如目录：

```
src

├── api
├── assets
├── components
├── constants
├── hooks
├── layouts
├── pages
├── router
├── store
├── styles
├── types
└── utils
```

---

NestJS：

默认集成：

- Config
- Logger
- ValidationPipe
- Swagger
- JWT（后续）

目录：

```
src

├── common
├── config
├── decorators
├── filters
├── guards
├── interceptors
├── middleware
├── modules
├── pipes
└── utils
```

做到：

> 创建项目即可开发。

---

# 六、第三阶段：沉淀业务模块

这是整个 Framework 最重要的部分。

例如：

```
modules

├── auth
├── user
├── role
├── permission
```

以后继续增加：

```
├── menu
├── dictionary
├── upload
├── file
├── operation-log
├── login-log
├── system-config
├── notification
```

所有后台项目都可以直接复用。

减少大量重复开发。

---

# 七、项目架构

目前统一采用：

```
apps
domain
shared
```

职责：

```
apps
```

负责：

> 程序如何运行。

例如：

- React
- Vue
- Electron
- NestJS

---

```
domain
```

负责：

> 定义业务模型。

例如：

```
Diary
User
Role
Permission
Menu
```

业务模型不依赖任何框架。

---

```
shared
```

负责：

> 公共能力。

例如：

- Logger
- 工具函数
- 日期处理
- 通用类型
- 常量

任何项目都可以复用。

---

# 八、包管理器

统一采用：

```
pnpm
```

原因：

- Workspace 支持成熟
- Monorepo 最佳实践
- 安装速度快
- 节省磁盘空间
- 社区生态完善

整个 Framework 不考虑 npm、Yarn。

统一：

```
pnpm install
pnpm dev
pnpm build
pnpm lint
```

---

# 九、开发顺序

## 第一阶段

完成基础模板：

- [ ] React Base
- [ ] Vue Base
- [ ] NestJS Base
- [ ] React Admin Base

---

## 第二阶段

完善模板能力：

- [ ] Router
- [ ] Axios
- [ ] TailwindCSS
- [ ] ESLint
- [ ] Prettier
- [ ] 环境变量
- [ ] 请求封装
- [ ] 路由封装

---

## 第三阶段

完善公共业务：

- [ ] 登录
- [ ] 用户
- [ ] 角色
- [ ] 权限
- [ ] 菜单
- [ ] 上传
- [ ] 字典
- [ ] 日志

---

## 第四阶段

继续增加模板：

- [ ] Electron
- [ ] SQLite
- [ ] MongoDB
- [ ] FullStack
- [ ] Monorepo

---

## 第五阶段

开发 CLI。

例如：

```
create react

create vue

create admin

create server

add electron

add sqlite

add tailwind
```

实现整个 Framework 自动化。

---

# 十、最终目标

形成一套真正属于自己的开发框架。

以后开发任何项目，都遵循：

```
选择模板
    ↓
安装依赖
    ↓
直接开始业务开发
```

无需再花时间：

- 配置环境
- 创建目录
- 安装常用依赖
- 编写基础业务模块

真正做到：

> **把时间投入到业务，而不是重复劳动。**