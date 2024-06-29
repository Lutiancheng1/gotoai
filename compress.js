// 打包时 自动构建以时间日期命名的压缩包文件
const fs = require('fs')
const archiver = require('archiver')
const moment = require('moment')

// 创建一个文件来输出压缩文件
const output = fs.createWriteStream(`./WEB_build_${moment().format('YYYY-MM-DD HH_mm_ss')}.zip`)
// @ts-ignore
const archive = archiver('zip', {
  zlib: { level: 9 } // 设置压缩级别。
})

// 监听所有 archive 数据源是否已完成。
output.on('close', function () {
  console.log(archive.pointer() + ' total bytes')
  console.log('Archiver has been finalized and the output file descriptor has closed.')
})

archive.on('error', function (err) {
  throw err
})

// 关联到输出文件
archive.pipe(output)

// 将 build 目录添加到归档中（使用 'false' 确保归档中的文件名称不会改变）
archive.directory('./build/', false)

// 完成归档（即压缩结束）
archive.finalize()
