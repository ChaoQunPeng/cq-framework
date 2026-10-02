/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    // 管理后台接口统一使用 /api/admin 前缀并代理到本地 Nest 服务。
    '/api/admin/': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
    // 公共上传接口由本地 Nest 服务提供。
    '/api/common': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
    '/uploads/': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
};
