export default [
  // 路由 name 使用国际化标识，菜单会按层级映射到对应的 menu.* 文案。
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  // 欢迎页不绑定业务权限，作为所有已登录管理员的统一入口。
  {
    path: '/welcome',
    name: 'home',
    icon: 'home',
    component: './Welcome',
  },
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    routes: [
      {
        path: '/system',
        access: 'canReadUser',
        redirect: '/system/users',
      },
      {
        path: '/system/users',
        name: 'users',
        access: 'canReadUser',
        component: './user-management',
      },
      {
        path: '/system/roles',
        name: 'roles',
        access: 'canReadRole',
        component: './role-management',
      },
    ],
  },
  // 保留旧地址用于历史书签跳转，不再作为独立菜单展示。
  {
    path: '/users',
    access: 'canReadUser',
    redirect: '/system/users',
    hideInMenu: true,
  },
  {
    path: '/exception/403',
    hideInMenu: true,
    component: './exception/403',
  },
  // 根地址固定进入无业务权限限制的欢迎页。
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './exception/404',
    layout: false,
    path: './*',
  },
];
