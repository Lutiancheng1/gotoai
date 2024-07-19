type EChartsOption = echarts.EChartsOption
//  商机汇总
export const businessOpportunitySummaryOption = (xData: string[], yData: number[]): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['个数'] // 更改为与您的数据相关的名称
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xData, // 更改为月份
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '每月商机个数', // 更改y轴名称
        axisLabel: {
          formatter: '{value}' // 显示格式
        }
      }
    ],
    series: [
      {
        name: '个数',
        type: 'bar',
        data: yData, // 假设的个数数据，您需要根据实际情况填写
        // 如果需要，可以添加以下配置来格式化tooltip的值
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 个'
          }
        }
      }
    ]
  }
}
// 商机预估金额
export const businessOpportunityEstimationAmountOption = (xData: string[], yData: number[]): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
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
      type: 'category',
      data: xData // Update to months
    },
    yAxis: {
      type: 'value',
      name: '金额(万元)',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '2024年商机预估合同额统计报告(金额)-按月(万元)',
        type: 'bar',
        stack: 'total',
        color: '#91cc75',
        tooltip: {
          valueFormatter: function (value) {
            return value + '万元'
          }
        },
        label: {
          show: true,
          position: 'inside' // Optional: Adjust label position for vertical bars
        },
        emphasis: {
          focus: 'series'
        },
        data: yData.map((item) => item / 10000)
      }
    ]
  }
}

// 项目汇总
export const projectSummaryOption = (xData: string[], yData: number[]): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['个数'] // 更改为与您的数据相关的名称
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xData, // 更改为月份
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '每月项目个数', // 更改y轴名称
        axisLabel: {
          formatter: '{value}' // 显示格式
        }
      }
    ],
    series: [
      {
        name: '个数',
        type: 'bar',
        data: yData, // 假设的个数数据，您需要根据实际情况填写
        // 如果需要，可以添加以下配置来格式化tooltip的值
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 个'
          }
        }
      }
    ]
  }
}
// 项目回款率
export const projectReturnRateOption = (xData: string[], yData: number[][]): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {},
    xAxis: [
      {
        type: 'category',
        data: xData,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '个数',
        axisLabel: {
          formatter: '{value} 个'
        }
      },
      {
        type: 'value',
        name: '个数',
        axisLabel: {
          formatter: '{value} 个'
        }
      }
    ],
    series: [
      {
        name: '实际回款个数',
        type: 'bar',
        stack: 'total',
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 个'
          }
        },
        data: yData[0]
      },

      {
        name: '计划回款个数',
        type: 'line',
        //stack: 'total',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 个'
          }
        },
        data: yData[1]
      }
    ]
  }
}
// 合同列收回款金额
export const contractColumnRepaymentAmountOption = (xData: string[], yData: number[][]): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {},
    xAxis: [
      {
        type: 'category',
        data: xData,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额(万元)',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '金额(万元)',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '实际回款金额',
        type: 'bar',
        stack: 'total',
        tooltip: {
          valueFormatter: function (value) {
            return value + '万元'
          }
        },
        data: yData[0].map((item) => Number((item / 10000).toFixed(2)))
      },

      {
        name: '计划回款金额',
        type: 'line',
        //stack: 'total',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: function (value) {
            return value + '万元'
          }
        },
        data: yData[1].map((item) => Number((item / 10000).toFixed(2)))
      }
    ]
  }
}

// 项目回款率分析
export const projectReturnRateAnalysisOption: EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  grid: {
    left: '4%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  legend: {},
  xAxis: [
    {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisPointer: {
        type: 'shadow'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '个数',
      axisLabel: {
        formatter: '{value} 个'
      }
    },
    {
      type: 'value',
      name: '个数',
      axisLabel: {
        formatter: '{value} 个'
      }
    }
  ],
  series: [
    {
      name: '实际回款个数',
      type: 'bar',
      stack: 'total',
      tooltip: {
        valueFormatter: function (value) {
          return value + ' 个'
        }
      },
      data: [2, 3, 6, 8, 5, 7, 6, 10, 5, 4, 5, 9]
    },

    {
      name: '计划回款个数',
      type: 'line',
      //stack: 'total',
      yAxisIndex: 1,
      tooltip: {
        valueFormatter: function (value) {
          return value + ' 个'
        }
      },
      data: [2, 3, 6, 8, 5, 7, 6, 10, 5, 4, 5, 9]
    }
  ]
}
