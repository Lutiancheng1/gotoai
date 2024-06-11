const { createProxyMiddleware } = require('http-proxy-middleware')
module.exports = function (app) {
  app.use(
    '/dev_mj',
    createProxyMiddleware({
      target: 'http://47.245.119.126:8080/mj', // 这里是你想要跨域访问的服务器地址
      changeOrigin: true,
      pathRewrite: {
        '^/dev_mj': '/mj'
      }
    })
  )

  app.use(
    '/dev_mj2',
    createProxyMiddleware({
      target: 'http://47.236.194.250:8062/mj', // 这里是你想要跨域访问的服务器地址
      changeOrigin: true,
      pathRewrite: {
        '^/dev_mj2': '/mj'
      }
    })
  )
}
