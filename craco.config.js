/**
 * TODO: 区分环境 —— NODE_ENV
 * - whenDev ☞ process.env.NODE_ENV === 'development'
 * - whenTest ☞ process.env.NODE_ENV === 'test'
 * - whenProd ☞ process.env.NODE_ENV === 'production'
 */
const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')
const { whenDev, whenProd } = require('@craco/craco')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')

module.exports = {
  // webpack 配置
  webpack: {
    // 配置别名
    alias: {
      // 约定：使用 @ 表示 src 文件所在路径
      '@': path.join(__dirname, 'src')
    },
    externals: {
      // 配置cdn外部资源不打包
    },
    configure: (webpackConfig, { env, paths }) => {
      // 添加新的规则
      webpackConfig.module.rules.unshift({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/docx-preview/, // 排除docx-preview
          /node_modules\/@microsoft\/fetch-event-source/ // 排除@microsoft/fetch-event-source
        ]
      })
      // // 添加处理 mp3 文件的规则
      // webpackConfig.module.rules.push({
      //   test: /\.mp3$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[path][name].[ext]',
      //         esModule: false // 这是关键
      //       }
      //     }
      //   ]
      // })
      return webpackConfig
    },
    plugins: [
      // webpack构建进度条
      // @ts-ignore
      new WebpackBar({
        profile: true
      }),
      // 查看打包的进度
      // @ts-ignore
      new SimpleProgressWebpackPlugin(),
      // @ts-ignore
      ...whenDev(
        () => [
          // webpack-dev-server 强化插件
          new webpack.HotModuleReplacementPlugin()
        ],
        []
      ),
      // @ts-ignore
      ...whenProd(
        () => [
          new TerserPlugin({
            // sourceMap: true, // Must be set to true if using source-maps in production
            terserOptions: {
              ecma: undefined,
              parse: {},
              compress: {
                // @ts-ignore
                warnings: false,
                drop_console: true, // 生产环境下移除控制台所有的内容
                drop_debugger: true, // 移除断点
                pure_funcs: ['console.log'] // 生产环境下移除console
              }
            }
          }),
          // 构建（build）过程中生成压缩版的资源文件。
          new CompressionWebpackPlugin({
            algorithm: 'gzip',
            test: /\.(js|ts|jsx|tsx|css|scss)$/,
            threshold: 1024,
            minRatio: 0.8
          })
        ],
        []
      )
    ]
  }
}
