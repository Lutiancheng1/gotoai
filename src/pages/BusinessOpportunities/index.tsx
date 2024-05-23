import { ConfigProvider, Tabs } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import Zhaobiao from '@/assets/images/zhaobiao.png'
import Huodong from '@/assets/images/huodong.jpg'
import Zhanlan from '@/assets/images/zhanlan.png'
import Baogao from '@/assets/images/baogao.png'
import * as echarts from 'echarts'
import './index.css'
type EChartsOption = echarts.EChartsOption
const tabsWarp = [
  {
    label: 'AI 商机线索',
    key: 'aiServiceViewBoard',
    disabled: true
  },
  {
    label: 'AI 招投标',
    key: 'aiCustomerServiceFollowUp'
  },
  {
    label: 'AI 找活动',
    key: 'aiCustomerQuery'
    // disabled: true
  },
  {
    label: 'AI 找展览会议',
    key: 'aiCustomersFollowUpHistory'
    // disabled: true
  },
  {
    label: 'AI找供应商',
    key: 'aiLookingForSuppliers',
    disabled: true
  },
  {
    label: 'AI 企查查',
    key: 'aiCompanyCheck',
    disabled: true
  },
  {
    label: 'AI 行业报告',
    key: 'aiIndustryReport'
    // disabled: true
  },
  {
    label: 'AI 行业头条',
    key: 'aiIndustryHeadline'
    // disabled: true
  },
  {
    label: 'AI跨境拓客',
    key: 'aiCrossBorderTuke',
    disabled: true
  }
]
const mustPlayChartOption: EChartsOption = {
  title: {
    text: '过年必玩的十种烟花'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['彩菊烟花 ', '金玉满堂烟花 ', '仙女棒', '火树银花烟花', '孔雀开屏烟花', '中洲出彩三分钟', '向日葵烟花 ', '银色喷泉烟花', '水母烟花', '加特林烟花']
  },
  series: [
    {
      type: 'bar',
      data: [84.0, 85.6, 87.2, 88.8, 90.4, 92.0, 93.0, 94.6, 96.2, 97.8],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '推荐指数{c}' // 标签格式
      }
    }
  ]
}
const brandChartOption: EChartsOption = {
  title: {
    text: '中国烟花十大品牌榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['亚太烟花 ', '红鹰烟花 ', '明义Meaning 烟花', '大围山烟花', '瑶金洲', '颐和隆烟花', '李渡烟花Lidu ', '庆泰QINGTAI', '东信烟花', '浏阳花炮']
  },
  series: [
    {
      type: 'bar',
      data: [77.7, 79.0, 80.2, 81.4, 82.5, 83.7, 85.0, 86.3, 87.5, 88.6],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '品牌数值{c}' // 标签格式
      }
    }
  ]
}
const powerChartOption: EChartsOption = {
  title: {
    text: '中国烟花十大实力榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['龙牌', '大围山', '吉腾', '瑶金洲', '金坪', '颐和隆烟花', '明义Meaning 烟花 ', '李渡烟花Lidu', '庆泰QINGTAI', '东信烟花']
  },
  series: [
    {
      type: 'bar',
      data: [72.6, 75.8, 77.9, 81.1, 83.4, 86.1, 91.3, 92.6, 94.8, 97.7],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '实力数值{c}' // 标签格式
      }
    }
  ]
}
const originChartOption: EChartsOption = {
  title: {
    text: '中国烟花十大产地榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['建湖花炮（江苏盐城）', '古营花炮（山东菏泽）', '架花烟火（陕西洋县）', '南张井老虎火（河北井陉县）', '蒲城烟花（陕西渭南）', '李渡花炮（江西南昌）', '万载花炮（江西宜春） ', '醴陵花炮（湖南醴陵）', '上栗花炮（江西萍乡）', '浏阳花炮（湖南长沙）']
  },
  series: [
    {
      type: 'bar',
      data: [84.5, 85.5, 87.1, 88.7, 90.5, 91.8, 93.3, 94.9, 96.2, 97.8],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '综合指数{c}' // 标签格式
      }
    }
  ]
}
const popularityChartOption: EChartsOption = {
  tooltip: {},
  title: [
    {
      text: '中国烟花十大人气榜'
    }
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'value',
      max: 120,
      splitLine: {
        show: false
      }
    }
  ],
  yAxis: [
    {
      type: 'category',
      data: ['红鹰', '世纪红烟花', '大围山', '瑶金洲', '李渡烟花', '东信烟花', '颐和隆', '庆泰', '明义烟花', '浏阳花炮'],
      axisLabel: {
        interval: 0,
        rotate: 30
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      type: 'bar',
      stack: 'chart',
      z: 3,
      barWidth: '50%', // 增大柱状图的宽度
      label: {
        position: 'right',
        show: true,
        formatter: '{c}' // 标签格式
      },
      data: [73.4, 75.9, 77.5, 81.9, 85.1, 87.9, 90, 93.6, 95.4, 99.6]
    }
  ]
}
const likeChartOption: EChartsOption = {
  tooltip: {},
  title: [
    {
      text: '中国烟花十大口碑点赞榜'
    }
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'value',
      max: 23000,
      splitLine: {
        show: false
      }
    }
  ],
  yAxis: [
    {
      type: 'category',
      data: ['瑶金洲', '世纪红烟花', '红鹰', '明义', '李渡烟花', '颐和隆', '东信烟花', '大围山', '庆泰', '浏阳花炮'],
      axisLabel: {
        interval: 0,
        rotate: 30
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      type: 'bar',
      stack: 'chart',
      z: 3,
      barWidth: '50%', // 增大柱状图的宽度
      label: {
        position: 'right',
        show: true
      },
      data: [2117, 2532, 2791, 2829, 3563, 5273, 6079, 6206, 10024, 17993]
    }
  ]
}
const nightViewChartOption: EChartsOption = {
  tooltip: {},
  title: [
    {
      text: '中国十大最美城市夜景排行榜'
    }
  ],
  grid: {
    left: '1%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'value',
      max: 120,
      splitLine: {
        show: false
      }
    }
  ],
  yAxis: [
    {
      type: 'category',
      data: ['奥林匹克塔·鸟巢·水立方夜景', '唐山南湖生态旅游风景区', '襄阳中国唐城夜场', '杭州西湖夜景', '广州珠江夜游·广州塔', '西安大唐芙蓉园夜景', '南京夫子庙秦淮河画舫夜游', '重庆洪崖洞夜景', '上海外滩夜景', '香港维多利亚港夜景'],
      axisLabel: {
        interval: 0,
        rotate: 30
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      type: 'bar',
      stack: 'chart',
      z: 3,
      barWidth: '50%', // 增大柱状图的宽度
      label: {
        position: 'right',
        show: true
      },
      data: [84.3, 85.9, 87.2, 88.9, 90, 91.6, 93.1, 94.8, 96, 97.8]
    }
  ]
}
const fireworkShowChartOption: EChartsOption = {
  title: {
    text: '中国十大烟火秀排行榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '1%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: [
      '津湾广场·滨城跨年烟花秀',
      '正定古正定古城·电子烟花秀',
      '成都330天府熊猫塔·电子烟花秀',
      '深圳世界之窗·烟花之舞',
      '珠海长隆海洋王国·烟花星闪幻彩show',
      '澳门观澳门观光塔·国际烟花比赛',
      '台北101大厦·跨年烟火表演',
      '上海迪士尼乐园·点亮奇梦：夜光幻影秀）',
      '维多利亚港·香港贺岁烟花汇演',
      '浏阳天空剧院·中国浏阳国际花炮节'
    ]
  },
  series: [
    {
      type: 'bar',
      data: [78.5, 79.6, 81.2, 82.8, 84.4, 85.5, 87.5, 88.8, 90.3, 91.6],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '推荐指数{c}' // 标签格式
      }
    }
  ]
}
const droneChartOption: EChartsOption = {
  title: {
    text: '中国十大无人机/烟花秀表演景区排行榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '1%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['青岛国际啤酒节烟花秀', '瘦西湖夜游无人机表演', '春茧体育中心无人机表演', '金山城市沙滩烟花节', '淮安西游乐园无人机表演', '龙之梦太湖古镇水舞秀 ', '古北水镇无人机表演', '无锡拈花湾无人机表演', '上海迪士尼烟花秀', '珠海长隆烟花']
  },
  series: [
    {
      type: 'bar',
      data: [84.2, 86.0, 87.1, 88.5, 90.0, 91.8, 93.3, 94.5, 96.3, 97.9],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '推荐指数{c}' // 标签格式
      }
    }
  ]
}
const scenicAreaChartOption: EChartsOption = {
  title: {
    text: '中国十大最美夜景景区排行榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '1%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['乌镇', '夜游龙门石窟', '夜游瘦西湖', '大雁塔·大唐不夜城', '夜游凤凰古城', '夜游黄果树瀑布 ', '夜游周庄古镇', '夜游南浔古镇', '夜游九龙潭', '雁荡山灵峰夜景']
  },
  series: [
    {
      type: 'bar',
      data: [78.5, 79.5, 81.5, 82.6, 84.1, 85.7, 87.1, 88.9, 90.1, 91.7],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '推荐指数{c}' // 标签格式
      }
    }
  ]
}
const guchengTownStreetChartOption: EChartsOption = {
  title: {
    text: '中国十大古城镇街巷景观排行榜'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '1%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: [
      '三坊七巷/屯溪老街/宽窄巷子等',
      '锦里/丽江古城百岁坊巷/拉萨八廓街等',
      '九龙峰林小镇/拈花湾小镇/婺源篁岭小镇等',
      '腾冲玛御谷温泉小镇/庐山温泉镇/蓝田汤峪镇等',
      '扎尕那/禾木村/白哈巴村/八角村·甘加秘境等',
      '西递·宏村/福建土楼/开平碉楼与古村落/银都水乡新华村等 ',
      '德夯苗寨/丹巴藏寨/程阳八寨/罗布人村寨等',
      '抱犊寨/八角寨/火石寨/万佛山侗寨等',
      '同里古镇/周庄古镇/乌镇/南浔古镇等',
      '丽江古城/平遥古城/阆中古城/徽州古城等'
    ]
  },
  series: [
    {
      type: 'bar',
      data: [78.2, 79.8, 81.4, 82.6, 84.3, 85.5, 87.4, 88.8, 90.1, 91.5],
      barWidth: 32,
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '排行指数{c}' // 标签格式
      }
    }
  ]
}
const fireworksFestivalCharOption: EChartsOption = {
  title: {
    text: '世界著名烟花节'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '1%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: [
      '马来西亚吉隆坡的双子塔跨年烟花表演',
      '泰国的湄南河烟花表演',
      '日本的江户川区花火大会',
      '美国的纽约独立日烟花秀',
      '新加坡滨海湾跨年烟火秀',
      '香港的维多利亚港贺岁烟花汇演',
      '迪拜的跨年烟火秀',
      '英国的伦敦跨年烟火秀',
      '澳大利亚的悉尼跨年烟花秀',
      '菲律宾的世界烟花奥林匹克大赛',
      '西班牙的圣塞瓦斯蒂安烟花比赛',
      '加拿大的烟花节',
      '马耳他的国际烟花节',
      '日本的花火大会'
    ]
  },
  series: [
    {
      type: 'bar',
      data: [78.2, 79.8, 81.4, 82.6, 84.3, 85.5, 87.4, 88.8, 90.1, 91.5, 93.6, 95.7, 96.8, 98.6],
      barWidth: 22, // 设置柱状图的粗细为40像素
      itemStyle: {
        color: function (params) {
          var colorList = ['#879091', '#879091', '#879091', '#879091', '#879091', '#757e80', '#636e70', '#505d5f', '#3e4c4f', '#456ca6', '#12c6ac', '#88a877', '#fb7b44', '#fb2c19']
          return colorList[params.dataIndex]
        },
        borderRadius: [0, 18, 18, 0]
      },
      label: {
        // 添加标签
        show: true, // 显示标签
        position: 'inside', // 标签位置
        formatter: '推荐指数{c}' // 标签格式
      }
    }
  ]
}

const Card = ({ src, title, date }: { src: string; title: string; date?: string }) => (
  <div className="flex h-[100px] overflow-hidden cursor-pointer">
    <img src={src} alt="" />
    <div className="flex flex-col ml-2">
      <p className="text-[#7f7f7f] font-500 line-clamp-3">{title}</p>
      <p className="text-[#7f7f7f] lg:mt-2 font-500">{date}</p>
    </div>
  </div>
)
const biddingData = {
  data1: [
    {
      title: '2024-2025年南京欢乐谷及玛雅海滩水公园烟花燃放项目',
      date: '2024-5-20',
      url: Zhaobiao
    },
    {
      title: '2024-2025年南京欢乐谷及玛雅海滩水公园烟花燃放项目',
      date: '2024-5-20',
      url: Zhaobiao
    },
    {
      title: '2024-2025年南京欢乐谷及玛雅海滩水公园烟花燃放项目',
      date: '2024-5-20',
      url: Zhaobiao
    }
  ],
  data2: [
    {
      items: [
        '2024-2025年南京欢乐谷及玛雅海滩水公园烟花燃放项目招标公告 （热）',
        '2024年丽江机场驱鸟烟花采购项目',
        '2024南陵海啸烟花音乐嘉年华活动',
        '2024内蒙古科技大学包头医学院校园运动会开幕式烟花采购项目',
        '2024年天津欢乐谷国潮文化节烟花表演服务采购项目  （热）',
        '2024年黑龙江伊春伊美区文体广电和旅游局活动烟花政府采购项目'
      ]
    },
    {
      items: [
        '2024年南昌玛雅乐园暑期烟花秀策划执行项目',
        '2024年衡阳玛雅海滩水公园烟花秀策划与执行项目',
        '2024年陇南机场公司驱鸟炮（二踢脚）及驱鸟烟花采购项目',
        '2024年山东日照海之秀烟花供货及燃放服务采购项目 （热）',
        '2024年江西宜春明月千古情景区烟花炮效服务采购项目',
        '2024年青海玉树烟花燃放服务项目'
      ]
    }
  ]
}
const activityData = {
  data1: [
    {
      title: '2024-2025年南京欢乐谷及玛雅海滩水公园烟花燃放',
      date: '2024-5-20',
      url: Huodong
    },
    {
      title: '2024年香港海上烟火表演',
      date: '2024-5-20',
      url: Huodong
    },
    {
      title: '2024年广州增城荔湖农业公园大型烟花秀',
      date: '2024-5-20',
      url: Huodong
    }
  ],
  data2: [
    {
      items: ['2024年河北省广宗县首届星空夜市烟花秀', '2024-2025年南京欢乐谷及玛雅海滩水公园烟花燃放', '2024年深圳世界之窗烟花表演', '2024年深圳欢乐海岸水秀剧场《深蓝秘境》烟花表演', '2024年香港海上烟火表演-6月15日', '2024浏阳周末焰火秀-第九场《西游记》', '2024年广州增城荔湖农业公园大型烟花秀']
    },
    {
      items: ['2024上海湾区·金山城市沙滩国际音乐烟花秀', '2024年察布查尔县塞锡湖烟花秀', '2024 江西上票县创意主题焰火晚会', '2024年广东顺德华侨城烟花汇演', '2024年黑龙江大庆兰德湖史诗级烟花秀', '2024年客都人家520专场烟花秀', '2024年贵州都匀茶博园大型烟花秀']
    }
  ]
}
const exhibitData = {
  data1: [
    {
      title: '中国（长沙）烟花爆竹产业博览会',
      url: Zhanlan
    },
    {
      title: '2024长沙烟花产业高质量发展论坛',
      url: Zhanlan
    },
    {
      title: '中国(浏阳)国际花炮文化节',
      url: Zhanlan
    }
  ],
  data2: [
    {
      title: '美国NFA烟花展',
      url: Zhanlan
    },
    {
      title: '湖北省烟花爆竹协会2024年产销对接交流会',
      url: Zhanlan
    },
    {
      title: '湖北省烟花爆竹协会2024年产销对接交流会',
      url: Zhanlan
    }
  ],
  data3: [
    {
      title: '2024国际花炮经贸合作暨烟花爆竹外贸出口产销交易会',
      url: Zhanlan
    },
    {
      title: '重庆市烟花爆竹行业协会2024年度会员大会暨供货会',
      url: Zhanlan
    },
    {
      title: '山东省2024年烟花爆竹交易会',
      url: Zhanlan
    }
  ]
}
const reportData = {
  data1: [
    {
      title: '中国烟花爆竹市场·战略咨询报告2024-基于对中国烟花爆竹市场的深度解析，而提出的战略探究',
      url: Baogao
    },
    {
      title: '中国花炮（烟花爆竹）市场趋势预测及投资风险分析报告2024-2030年 中赢信合研究网',
      url: Baogao
    },
    {
      title: '全球及中国烟花市场调研报告(市场版)全球环保研究网',
      url: Baogao
    }
  ]
}
const headlineData = {
  data: [
    {
      items: [
        '湖南开展烟花爆竹产品质量整治行动',
        '醴陵市烟花爆竹企业复工复产指南，严格执行5项负面清单管理',
        '探讨烟花爆竹行业发展新方向 2024长沙烟花产业高质量发展论坛举行',
        '今年6月底，长沙首批46家烟花鞭炮试点企业完成数字化改造“体检”',
        '千年传承 历久弥新——从第五届中国烟花爆竹博览会看醴陵花炮的嬗变之路',
        '江西省2024年烟花爆竹安全经营管理暨产品交易大会圆满落下帷幕！',
        '第五届中国烟花爆竹博览会暨2024醴陵烟花爆竹交易会开馆',
        '湖南浏阳5月17日召开花炮行业招商座谈会'
      ]
    },
    {
      items: [
        '“禁燃令”下的浏阳与烟花：年产值突破500亿元，期待再盛放',
        '超1.2万种新型精品烟花及设备亮相长沙',
        '日流水200000元，烟花经销商又赢麻了？',
        '新技术、新场景、新媒体，顶流商业导师张琦赋能花炮产业',
        '重庆烟花爆竹集团携手重庆融创文旅联袂打造“山城夜焰”',
        '首届烟花千人峰会圆满落幕，大咖云集，掀起行业变革浪潮',
        '合同金额1.1亿元 2024年重庆市烟花爆竹供货会举行',
        '湖南浏阳：文化赋能，烟花产业焕发新活力',
        '浏阳市烟花爆竹领域安全生产警示教育大会召开'
      ]
    }
  ]
}
type BusinessOpportunitiesProps = {}
const BusinessOpportunities: React.FC<BusinessOpportunitiesProps> = () => {
  const [activeKey, setActiveKey] = useState('aiCustomerServiceFollowUp')
  const mustPlayChartref = useRef<HTMLDivElement>(null)
  const brandChartRef = useRef<HTMLDivElement>(null)
  const powerChartRef = useRef<HTMLDivElement>(null)
  const originChartRef = useRef<HTMLDivElement>(null)
  const popularityChartRef = useRef<HTMLDivElement>(null)
  const likeChartRef = useRef<HTMLDivElement>(null)
  const nightViewCharRef = useRef<HTMLDivElement>(null)
  const fireworkShowCharRef = useRef<HTMLDivElement>(null)
  const droneCharRef = useRef<HTMLDivElement>(null)
  const scenicAreaChartRef = useRef<HTMLDivElement>(null)
  const guchengTownStreetChartRef = useRef<HTMLDivElement>(null)
  const fireworksFestivalCharRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (activeKey !== 'aiIndustryReport') return
    if (
      mustPlayChartref.current &&
      brandChartRef.current &&
      powerChartRef.current &&
      originChartRef.current &&
      popularityChartRef.current &&
      likeChartRef.current &&
      nightViewCharRef.current &&
      fireworkShowCharRef.current &&
      droneCharRef.current &&
      scenicAreaChartRef.current &&
      guchengTownStreetChartRef.current &&
      fireworksFestivalCharRef.current
    ) {
      echarts.init(mustPlayChartref.current).setOption(mustPlayChartOption)
      echarts.init(brandChartRef.current).setOption(brandChartOption)
      echarts.init(powerChartRef.current).setOption(powerChartOption)
      echarts.init(originChartRef.current).setOption(originChartOption)
      echarts.init(popularityChartRef.current).setOption(popularityChartOption)
      echarts.init(likeChartRef.current).setOption(likeChartOption)
      echarts.init(nightViewCharRef.current).setOption(nightViewChartOption)
      echarts.init(fireworkShowCharRef.current).setOption(fireworkShowChartOption)
      echarts.init(droneCharRef.current).setOption(droneChartOption)
      echarts.init(scenicAreaChartRef.current).setOption(scenicAreaChartOption)
      echarts.init(guchengTownStreetChartRef.current).setOption(guchengTownStreetChartOption)
      echarts.init(fireworksFestivalCharRef.current).setOption(fireworksFestivalCharOption)
    }
  }, [activeKey])
  return (
    <div className="business-opportunities">
      {/* 上方tab切换*/}
      <section className="opportunities-tabs bg-white flex justify-start">
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                /* 这里是你的组件 token */
                inkBarColor: '#dcddde',
                itemActiveColor: '#1a2029',
                itemSelectedColor: '#1a2029',
                itemHoverColor: '',
                horizontalMargin: '0px',
                titleFontSize: 20,
                horizontalItemPadding: '8px',
                itemColor: 'rgba(0, 0, 0, 0.25)',
                horizontalItemGutter: 6
              }
            }
          }}
        >
          <Tabs centered className="font-500" style={{ height: '46px' }} activeKey={activeKey} items={tabsWarp} onTabClick={(key) => setActiveKey(key)} />
        </ConfigProvider>
      </section>
      {/* 下方内容区域 */}
      <div className="business_opportunities-content w-full h-[calc(100vh-62px)] p-3">
        {activeKey === 'aiCustomerServiceFollowUp' && (
          <div className="w-full h-full">
            <div className="my-4">
              <div className="text-18 font-500 text-[#7f7f7f]">热门活动</div>
            </div>
            <div className="grid grid-cols-3 gap-4 lg:gap-10 mb-8">
              {biddingData.data1.map((item, index) => (
                <Card key={index} src={item.url} title={item.title} date={item.date} />
              ))}
            </div>
            <div className="mb-4">
              <div className="text-18 font-500 text-[#7f7f7f]">近期招标项目</div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                {biddingData.data2.map((column, columnIndex) => (
                  <div className="flex" key={columnIndex}>
                    <div className="border-r border-gray-400 h-full mr-2"></div>
                    <ul>
                      {column.items.map((item, index) => (
                        <li className="mb-2" key={index}>
                          <a href="#"> {item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeKey === 'aiCustomerQuery' && (
          <div className="w-full h-full">
            <div className="my-4">
              <div className="text-18 font-500 text-[#7f7f7f]">热门活动</div>
            </div>
            <div className="grid grid-cols-3 gap-4 lg:gap-10 mb-8">
              {activityData.data1.map((item, index) => (
                <Card key={index} src={item.url} title={item.title} date={item.date} />
              ))}
            </div>
            <div className="mb-4">
              <div className="text-18 font-500 text-[#7f7f7f]">近期招标项目</div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                {activityData.data2.map((column, columnIndex) => (
                  <div className="flex" key={columnIndex}>
                    <div className="border-r border-gray-400 h-full mr-2"></div>
                    <ul>
                      {column.items.map((item, index) => (
                        <li className="mb-2" key={index}>
                          <a href="#"> {item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeKey === 'aiCustomersFollowUpHistory' && (
          <div className="w-full h-full">
            <div className="my-4">
              <div className="text-18 font-500 text-[#7f7f7f]">热门展览会议</div>
            </div>
            <div className="grid grid-cols-3 gap-4 lg:gap-10 mb-8">
              {exhibitData.data1.map((item, index) => (
                <Card key={index} src={item.url} title={item.title} />
              ))}
            </div>
            <div className="mb-4">
              <div className="text-18 font-500 text-[#7f7f7f]">近期展览会议</div>
            </div>
            <div>
              <div className="grid grid-cols-3 gap-4 lg:gap-10 mb-8">
                {exhibitData.data2.map((item, index) => (
                  <Card key={index} src={item.url} title={item.title} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 lg:gap-10 mb-8">
                {exhibitData.data3.map((item, index) => (
                  <Card key={index} src={item.url} title={item.title} />
                ))}
              </div>
            </div>
          </div>
        )}
        {activeKey === 'aiIndustryReport' && (
          <div className="w-full h-full">
            <div className="my-4">
              <div className="text-18 font-500 text-[#7f7f7f]">最新前景分析报告</div>
            </div>
            <div className="grid grid-cols-3 gap-4 lg:gap-10 mb-8">
              {reportData.data1.map((item, index) => (
                <div key={index} className="flex h-[100px] overflow-hidden cursor-pointer">
                  <img src={item.url} alt="" />
                  <div className="flex flex-col ml-2">
                    <p className="text-[#7f7f7f] font-500">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[calc(100vh-265px)] w-full overflow-scroll nw-scrollbar">
              <div className="h-[75%] w-full border-b p-2">
                <div className="w-full h-full grid grid-cols-2 gap-4 lg:gap-10 mb-4">
                  <div className="w-full h-full border-r">
                    <div className="w-full h-full" ref={mustPlayChartref}></div>
                  </div>
                  <div className="w-full h-full">
                    <div className="w-full h-full" ref={originChartRef}></div>
                  </div>
                </div>
              </div>
              <div className="h-[75%] w-full border-b p-2">
                <div className=" w-full h-full grid grid-cols-2 gap-4 lg:gap-10 mb-4">
                  <div className="w-full h-full border-r">
                    <div className="w-full h-full" ref={brandChartRef}></div>
                  </div>
                  <div className="w-full h-full">
                    <div className="w-full h-full" ref={popularityChartRef}></div>
                  </div>
                </div>
              </div>
              <div className="h-[75%] w-full border-b p-2">
                <div className="w-full h-full grid grid-cols-2 gap-4 lg:gap-10 mb-4">
                  <div className="w-full h-full border-r">
                    <div className="w-full h-full" ref={powerChartRef}></div>
                  </div>
                  <div className="w-full h-full">
                    <div className="w-full h-full" ref={likeChartRef}></div>
                  </div>
                </div>
              </div>
              <div className="h-[75%] w-full border-b p-2">
                <div className="w-full h-full grid grid-cols-2 gap-4 lg:gap-10 mb-4">
                  <div className="w-full h-full border-r">
                    <div className="w-full h-full" ref={fireworkShowCharRef}></div>
                  </div>
                  <div className="w-full h-full">
                    <div className="w-full h-full" ref={nightViewCharRef}></div>
                  </div>
                </div>
              </div>
              <div className="h-[75%] w-full border-b p-2">
                <div className="w-full h-full grid grid-cols-2 gap-4 lg:gap-10 mb-4">
                  <div className="w-full h-full border-r">
                    <div className="w-full h-full" ref={droneCharRef}></div>
                  </div>
                  <div className="w-full h-full">
                    <div className="w-full h-full" ref={scenicAreaChartRef}></div>
                  </div>
                </div>
              </div>
              <div className="h-[75%] w-full border-b p-2">
                <div className="w-full h-full grid grid-cols-2 gap-4 lg:gap-10 mb-4">
                  <div className="w-full h-full border-r">
                    <div className="w-full h-full" ref={guchengTownStreetChartRef}></div>
                  </div>
                  <div className="w-full h-full">
                    <div className="w-full h-full" ref={fireworksFestivalCharRef}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeKey === 'aiIndustryHeadline' && (
          <div>
            <div className="mb-4">
              <div className="text-18 font-500 text-[#7f7f7f]">头条快讯</div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                {headlineData.data.map((column, columnIndex) => (
                  <div className="flex" key={columnIndex}>
                    <div className="border-r border-gray-400 h-full mr-6"></div>
                    <ul>
                      {column.items.map((item, index) => (
                        <li className="mb-2" key={index}>
                          <a href="#"> {item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeKey === 'aiCompanyCheck' && <iframe width={'100%'} height={'100%'} src="https://www.tianyancha.com/" title="qcc"></iframe>}
      </div>
    </div>
  )
}
export default BusinessOpportunities
