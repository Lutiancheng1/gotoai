const { createProxyMiddleware } = require('http-proxy-middleware')
module.exports = function (app) {
  app.use(
    '/mj',
    createProxyMiddleware({
      target: 'http://47.245.119.126:8080/mj', // 这里是你想要跨域访问的服务器地址
      changeOrigin: true
    })
  )
  app.use(
    '/baidu',
    createProxyMiddleware({
      target: 'https://fanyi-api.baidu.com/api/trans/vip/translate', // 这里是你想要跨域访问的服务器地址
      changeOrigin: true,
      pathRewrite: {
        '^/baidu': ''
      }
    })
  )
  app.use(
    '/dify',
    createProxyMiddleware({
      target: 'https://admin.gotoai.world/v1/apps', // 这里是你想要跨域访问的服务器地址
      changeOrigin: true,
      pathRewrite: {
        '^/dify': ''
      }
    })
  )
  app.use(
    '/resource',
    createProxyMiddleware({
      target: 'https://resource.gotoai.world', // 这里是你想要跨域访问的服务器地址
      changeOrigin: true,
      pathRewrite: {
        '^/resource': ''
      }
    })
  )
}
