# my-project

## Directory

```
my-project
│
├── apps
│   ├── diary
│   ├── admin
│   ├── website
│   └── server
│
├── domain
├── shared
├── api-contract
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## apps/

所有可运行的应用。

每个应用都是独立的。

例如：

- React
- Vue
- Electron
- NestJS

以后可以继续新增：

- ai-chat
- cms
- mobile
- docs

---

## domain/

业务模型。

例如：

- User
- Diary
- Product

只放：

- 类型
- 枚举
- 领域常量

---

## shared/

公共工具。

例如：

- utils
- logger
- constants
- helpers

不放业务逻辑。

---

## api-contract/

前后端接口协议。

例如：

- DTO
- Request
- Response
- API Types
