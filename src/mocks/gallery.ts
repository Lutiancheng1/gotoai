import Mock from 'mockjs'
const galleryData = require('./gallery.json')
// 使用Mock来模拟数据
console.log(galleryData)

Mock.mock('/api/gallery', 'get', galleryData)
