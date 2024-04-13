const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  // app.use(
  //   '/mj',
  //   createProxyMiddleware({
  //     target: 'http://52.175.37.113:8082/mj/', // 这里是你想要跨域访问的服务器地址
  //     changeOrigin: true
  //   })
  // )
  // app.use(
  //   '/dify',
  //   createProxyMiddleware({
  //     target: 'https://admin.gotoai.world/v1/apps', // 这里是你想要跨域访问的服务器地址
  //     changeOrigin: true
  //   })
  // )
}
