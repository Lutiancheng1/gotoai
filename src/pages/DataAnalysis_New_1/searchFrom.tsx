import React, { FC, useState } from 'react'
import { Form, Input, Button, Select, DatePicker, Table } from 'antd'
import { useUpdateEffect } from 'ahooks'
import { ConfigProvider } from 'antd'
import locale from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import { CloseOutlined } from '@ant-design/icons'
import 'dayjs/locale/zh-cn'
import { BusinessSearch, ProjectRevenueSearch, ProjectSearch } from '@/api/analyze'
dayjs.locale('zh-cn')

interface SearchButtonsProps {
  onSearch?: () => void
  onClear?: () => void
}
interface FieldValue {
  [key: string]: any // 可以根据实际情况进一步细化类型，例如使用 string | moment.Moment | number
}

export type DataSourceT = {
  pageCount: number
  pageIndex: number
  recordCount: number
  rows: any[]
}
interface TabFormProps {
  currentTab: 'businessOpportunity' | 'project' | 'management'
  onFinish: (values: any, D?: DataSourceT) => void // 可以根据实际情况进一步细化 onFinish 的参数类型
  onSearch?: () => void
  fields?: any
  hasResult?: boolean
  onClosed?: () => void
  hideMore?: boolean
  data?: DataSourceT
}

const SearchFrom: FC<TabFormProps> = ({ currentTab, onFinish, fields, hasResult = false, onClosed, hideMore = true, onSearch, data }) => {
  const classNames = 'flex h-[38px]'
  const formItemStyle = { width: 140 }
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState<DataSourceT>({
    pageCount: 0,
    pageIndex: 0,
    recordCount: 0,
    rows: []
  }) // 表格数据源
  const [fieldsValue, setFieldsValue] = useState<FieldValue>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const formatValues = (values: FieldValue): FieldValue => {
    return Object.keys(values).reduce((acc: FieldValue, key: string) => {
      const value = values[key]
      if (value && value.$isDayjsObject) {
        // 检查键名是否以"Month"结尾来决定使用哪种格式
        const formatString = key.endsWith('Month') ? 'YYYY-MM' : 'YYYY-MM-DD'
        acc[key] = value.format(formatString)
      } else if (Array.isArray(value)) {
        // 如果是数组，递归处理数组中的每个元素
        acc[key] = value.map((item) => formatValues({ tempKey: item })['tempKey'])
      } else if (typeof value === 'object' && value !== null) {
        // 如果是对象，递归处理对象中的每个字段
        acc[key] = formatValues(value)
      } else if (value !== undefined && value !== null && value !== '') {
        // 只有当值不是 undefined、null 或空字符串时，才将其加入到结果中
        acc[key] = value
      }
      // 如果值是 undefined、null 或空字符串，则不加入到结果中，从而“过滤掉”
      return acc
    }, {})
  }

  const handleSearch = async () => {
    onSearch && onSearch()
    const values: FieldValue = form.getFieldsValue()
    const formattedValues: FieldValue = formatValues(values)
    console.log(formattedValues)
    getDataSource(formattedValues, 1)
    setFieldsValue(formattedValues)
  }
  const changePagination = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    setPageSize(pageSize || 10)
    getDataSource(fieldsValue, page, pageSize)
  }
  const getDataSource = async (formattedValues: FieldValue, page?: number, size?: number) => {
    page && page !== currentPage && setCurrentPage(page)
    let s
    if (currentTab === 'businessOpportunity') {
      const res = await BusinessSearch({
        page: page ? page : currentPage,
        pageSize: size ? size : pageSize,
        entryStartTime: formattedValues.opportunityTime_Month,
        entryEndTime: formattedValues.opportunityTime_Month,
        currentStatus: formattedValues.projectStatus,
        customerManager: formattedValues.customerManager,
        customerName: formattedValues.customerName,
        estimatedContractMin: formattedValues.estimatedContractValue,
        estimatedContractMax: formattedValues.estimatedContractValue
      })
      if (res) {
        setDataSource(() => {
          const d = {
            pageCount: res.pageCount,
            pageIndex: res.pageIndex,
            recordCount: res.recordCount,
            rows: res.rows
          }
          s = d
          return d
        })
      }
    } else if (currentTab === 'project') {
      const res = await ProjectSearch({
        page: page ? page : currentPage,
        pageSize: size ? size : pageSize,
        signingStartTime: formattedValues.projectTime_Month,
        customerName: formattedValues.customerName,
        projectManager: formattedValues.projectManager,
        contractAmountMin: formattedValues.contractAmount && Number(formattedValues.contractAmount.split(',')[0]),
        contractAmountMax: formattedValues.contractAmount && Number(formattedValues.contractAmount.split(',')[1])
      })
      if (res) {
        setDataSource(() => {
          const d = {
            pageCount: res.pageCount,
            pageIndex: res.pageIndex,
            recordCount: res.recordCount,
            rows: res.rows
          }
          s = d
          return d
        })
      }
    } else if (currentTab === 'management') {
      const res = await ProjectRevenueSearch({
        page: page ? page : currentPage,
        pageSize: size ? size : pageSize,
        signingStartTime: formattedValues.contractSigningTime,
        signingEndTime: formattedValues.contractSigningTime,
        customerName: formattedValues.customerName,
        projectManager: formattedValues.customerManager,
        currentStatus: formattedValues.projectStatus,
        contractAmountMin: formattedValues.contractAmount && Number(formattedValues.contractAmount.split(',')[0]),
        contractAmountMax: formattedValues.contractAmount && Number(formattedValues.contractAmount.split(',')[1]),
        paymentMin: formattedValues.paymentReceived && Number(formattedValues.paymentReceived.split(',')[0]),
        paymentMax: formattedValues.paymentReceived && Number(formattedValues.paymentReceived.split(',')[1])
      })
      if (res) {
        setDataSource(() => {
          const d = {
            pageCount: res.pageCount,
            pageIndex: res.pageIndex,
            recordCount: res.recordCount,
            rows: res.rows
          }
          s = d
          return d
        })
      }
    }
    onFinish(formattedValues, s)
  }
  const handleClear = () => {
    // 执行清除操作
    form.resetFields()
    onFinish({})
    getDataSource({})
  }
  useUpdateEffect(() => {
    // 创建一个新对象来存储可能转换后的字段值
    const transformedFields: FieldValue = {}

    // 遍历 fields 对象的每个字段
    Object.keys(fields).forEach((key) => {
      const value = fields[key]
      // 检查字段值是否为 'YYYY-MM' 格式的日期字符串
      if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
        // 如果是，将其转换为 dayjs 对象
        transformedFields[key] = dayjs(value, 'YYYY-MM')
      } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // 检查字段值是否为 'YYYY-MM-DD' 格式的日期字符串
        // 如果是，同样将其转换为 dayjs 对象，但使用不同的格式
        transformedFields[key] = dayjs(value, 'YYYY-MM-DD')
      } else {
        // 如果不是日期字符串，保留原始值
        transformedFields[key] = value
      }
    })

    // 使用可能已转换的字段值来设置表单字段
    form.setFieldsValue(transformedFields)
  }, [fields])

  useUpdateEffect(() => {
    form.resetFields()
  }, [currentTab])

  useUpdateEffect(() => {
    // 外部传入的 data 发生变化时，更新表格数据源
    if (data) {
      setDataSource(data)
    }
  }, [data])

  const businessOpportunColumns = [
    // { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '所属系统组织ID', dataIndex: 'belong_sys_org_id', key: 'belong_sys_org_id' },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time' },
    { title: '创建系统用户ID', dataIndex: 'create_sys_user_id', key: 'create_sys_user_id' },
    { title: '更新时间', dataIndex: 'update_time', key: 'update_time' },
    { title: '更新系统用户ID', dataIndex: 'update_sys_user_id', key: 'update_sys_user_id' },
    { title: '业务代码', dataIndex: 'business_code', key: 'business_code' },
    { title: '合作比例', dataIndex: 'collaboration_ratio', key: 'collaboration_ratio' },
    { title: '合同金额', dataIndex: 'contract_amount', key: 'contract_amount' },
    { title: '当前状态', dataIndex: 'current_status', key: 'current_status' },
    { title: '客户经理', dataIndex: 'customer_manager', key: 'customer_manager' },
    { title: '客户名称', dataIndex: 'customer_name', key: 'customer_name' },
    { title: '录入时间', dataIndex: 'entry_time', key: 'entry_time' },
    { title: '预估合同价值', dataIndex: 'estimated_contract_value', key: 'estimated_contract_value' },
    { title: '预估最终付款', dataIndex: 'estimated_final_payment', key: 'estimated_final_payment' },
    { title: '预估首付款', dataIndex: 'estimated_first_payment', key: 'estimated_first_payment' },
    { title: '预估第二次付款', dataIndex: 'estimated_second_payment', key: 'estimated_second_payment' },
    { title: '最终付款时间', dataIndex: 'final_payment_time', key: 'final_payment_time' },
    { title: '首付款时间', dataIndex: 'first_payment_time', key: 'first_payment_time' },
    { title: '项目代码', dataIndex: 'project_code', key: 'project_code' },
    { title: '项目名称', dataIndex: 'project_name', key: 'project_name' },
    { title: '第二次付款时间', dataIndex: 'second_payment_time', key: 'second_payment_time' },
    { title: '签约可能性', dataIndex: 'signing_possibility', key: 'signing_possibility' },
    { title: '有效收入', dataIndex: 'valid_income', key: 'valid_income' }
  ]
  const projectColumns = [
    // { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '编号', dataIndex: 'number', key: 'number' },
    { title: '所属系统组织ID', dataIndex: 'belong_sys_org_id', key: 'belong_sys_org_id' },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time' },
    { title: '创建系统用户ID', dataIndex: 'create_sys_user_id', key: 'create_sys_user_id' },
    { title: '更新时间', dataIndex: 'update_time', key: 'update_time' },
    { title: '更新系统用户ID', dataIndex: 'update_sys_user_id', key: 'update_sys_user_id' },
    { title: '同意的最终付款金额', dataIndex: 'agreed_final_payment_amount', key: 'agreed_final_payment_amount' },
    { title: '同意的最终付款时间', dataIndex: 'agreed_final_payment_time', key: 'agreed_final_payment_time' },
    { title: '同意的首付款金额', dataIndex: 'agreed_first_payment_amount', key: 'agreed_first_payment_amount' },
    { title: '同意的首付款时间', dataIndex: 'agreed_first_payment_time', key: 'agreed_first_payment_time' },
    { title: '同意的第二次付款金额', dataIndex: 'agreed_second_payment_amount', key: 'agreed_second_payment_amount' },
    { title: '同意的第二次付款时间', dataIndex: 'agreed_second_payment_time', key: 'agreed_second_payment_time' },
    { title: '税后金额', dataIndex: 'amount_after_tax', key: 'amount_after_tax' },
    { title: '开票率', dataIndex: 'billing_rate', key: 'billing_rate' },
    { title: '业务代码', dataIndex: 'business_code', key: 'business_code' },
    { title: '合作比例', dataIndex: 'collaboration_ratio', key: 'collaboration_ratio' },
    { title: '合同金额', dataIndex: 'contract_amount', key: 'contract_amount' },
    { title: '最终付款', dataIndex: 'final_payment', key: 'final_payment' },
    { title: '最终付款开票', dataIndex: 'final_payment_billing', key: 'final_payment_billing' },
    { title: '最终付款开票时间', dataIndex: 'final_payment_billing_time', key: 'final_payment_billing_time' },
    { title: '最终付款时间', dataIndex: 'final_payment_time', key: 'final_payment_time' },
    { title: '首付款', dataIndex: 'first_payment', key: 'first_payment' },
    { title: '首付款开票', dataIndex: 'first_payment_billing', key: 'first_payment_billing' },
    { title: '首付款开票时间', dataIndex: 'first_payment_billing_time', key: 'first_payment_billing_time' },
    { title: '首付款时间', dataIndex: 'first_payment_time', key: 'first_payment_time' },
    { title: '负责领导', dataIndex: 'leader_in_charge', key: 'leader_in_charge' },
    { title: '项目状态', dataIndex: 'project_status', key: 'project_status' },

    { title: '付款安排', dataIndex: 'payment_arrangement', key: 'payment_arrangement' },
    { title: '付款率', dataIndex: 'payment_rate', key: 'payment_rate' },
    { title: '项目经理', dataIndex: 'project_manager', key: 'project_manager' },
    { title: '项目名称', dataIndex: 'project_name', key: 'project_name' },
    { title: '项目进度', dataIndex: 'project_progress', key: 'project_progress' },
    { title: '第二次付款', dataIndex: 'second_payment', key: 'second_payment' },
    { title: '第二次付款开票', dataIndex: 'second_payment_billing', key: 'second_payment_billing' },
    { title: '第二次付款开票时间', dataIndex: 'second_payment_billing_time', key: 'second_payment_billing_time' },
    { title: '第二次付款时间', dataIndex: 'second_payment_time', key: 'second_payment_time' },
    { title: '签约时间', dataIndex: 'signing_time', key: 'signing_time' },
    { title: '客户名称', dataIndex: 'customer_name', key: 'customer_name' },
    { title: '更新表日期', dataIndex: 'update_table_date', key: 'update_table_date' },
    { title: '工作日进度', dataIndex: 'workday_progress', key: 'workday_progress' }
  ]
  const columns = () => {
    if (currentTab === 'businessOpportunity') {
      return businessOpportunColumns
    } else {
      return projectColumns
    }
  }
  const SearchButtons: FC<SearchButtonsProps> = ({ onSearch = handleSearch, onClear = handleClear }) => (
    <>
      <Button type="primary" className="bg-[#1677ff] mr-4" onClick={onSearch}>
        搜索
      </Button>
      <Button type="primary" className="bg-[#1677ff]" onClick={onClear}>
        清除
      </Button>
    </>
  )
  return (
    <ConfigProvider locale={locale}>
      <div className="mb-2 flex justify-between">
        <div className="font-600 text-18 text-[#747474]">实时查询与分析 {hasResult && `- ${currentTab === 'businessOpportunity' ? '商机' : currentTab === 'management' ? '经营' : '项目'}`}</div>
        {hasResult && (
          <div>
            <CloseOutlined onClick={onClosed} className="text-18 cursor-pointer" />
          </div>
        )}
      </div>
      <Form form={form} onFinish={onFinish}>
        {currentTab === 'businessOpportunity' && (
          <>
            <div className={classNames}>
              <Form.Item label="商机时间" name="opportunityTime_Month" className="mr-4">
                <DatePicker style={formItemStyle} picker="month" placeholder="请选择商机时间" />
              </Form.Item>
              <Form.Item label="项目状态" name="projectStatus" className="mr-4">
                <Select
                  style={formItemStyle}
                  allowClear
                  placeholder="请选择项目状态"
                  options={[
                    { label: '已失效', value: '已失效' },
                    { label: '已转项目', value: '已转项目' },
                    { label: '其它', value: '其它' }
                  ]}
                />
              </Form.Item>
              <Form.Item label="客户名称" name="customerName" className="mr-4">
                <Input autoComplete="off" style={formItemStyle} allowClear placeholder="请输入客户名称" />
              </Form.Item>
              <SearchButtons />
            </div>
            <div className={classNames}>
              <Form.Item label="客户经理" name="customerManager" className="mr-4">
                <Input autoComplete="off" allowClear style={formItemStyle} placeholder="请输入客户经理" />
              </Form.Item>
              <Form.Item label="预估合同额(单位w元)" name="estimatedContractValue" className="mr-4">
                <Select
                  style={formItemStyle}
                  allowClear
                  placeholder="请选择预估合同额"
                  options={[
                    { label: 30, value: 30 * 10000 },
                    { label: 50, value: 50 * 10000 },
                    { label: 100, value: 100 * 10000 },
                    { label: 500, value: 500 * 10000 }
                  ]}
                />
              </Form.Item>
            </div>
          </>
        )}
        {currentTab === 'project' && (
          <>
            <div className={classNames}>
              <Form.Item label="项目时间" name="projectTime_Month" className="mr-4">
                <DatePicker style={formItemStyle} picker="month" placeholder="请选择项目时间" />
              </Form.Item>
              <Form.Item label="客户名称" name="customerName" className="mr-4">
                <Input autoComplete="off" allowClear style={formItemStyle} placeholder="请输入客户名称" />
              </Form.Item>
              <Form.Item label="项目经理" name="projectManager" className="mr-4">
                <Input autoComplete="off" allowClear style={formItemStyle} placeholder="请输入项目经理" />
              </Form.Item>
              <SearchButtons />
            </div>
            <div className={classNames}>
              <Form.Item label="合同金额(单位w元)" name="contractAmount" className="mr-4">
                <Select
                  style={formItemStyle}
                  allowClear
                  placeholder="请选择合同金额"
                  options={[
                    { label: '30~50', value: [30 * 10000, 50 * 10000].toString() },
                    { label: '50~100', value: [50 * 10000, 100 * 10000].toString() },
                    { label: '100~500', value: [100 * 10000, 500 * 10000].toString() }
                  ]}
                />
              </Form.Item>
            </div>
          </>
        )}
        {currentTab === 'management' && (
          <>
            <div className={classNames}>
              <Form.Item label="项目时间" name="projectTime_Month" className="mr-4">
                <DatePicker style={formItemStyle} picker="month" placeholder="请选择项目时间" />
              </Form.Item>
              <Form.Item label="合同签订时间" name="contractSigningTime" className="mr-4">
                <DatePicker style={formItemStyle} placeholder="请选择签订时间" />
              </Form.Item>
              <Form.Item label="客户名称" name="customerName" className="mr-4">
                <Input autoComplete="off" style={formItemStyle} allowClear placeholder="请输入客户名称" />
              </Form.Item>
              {/* <Form.Item label="项目状态" name="projectStatus" className="mr-4">
                <Select
                  style={formItemStyle}
                  allowClear
                  placeholder="请选择项目状态"
                  options={[
                    { label: '已失效', value: '已失效' },
                    { label: '已转项目', value: '已转项目' },
                    { label: '其它', value: '其它' }
                  ]}
                />
              </Form.Item> */}
              <SearchButtons />
            </div>
            <div className={classNames}>
              <Form.Item label="客户经理" name="customerManager" className="mr-4">
                <Input autoComplete="off" allowClear style={formItemStyle} placeholder="请输入客户经理" />
              </Form.Item>
              <Form.Item label="合同金额" name="contractAmount" className="mr-4">
                <Select
                  style={formItemStyle}
                  allowClear
                  placeholder="请选择合同金额"
                  options={[
                    { label: '30~50', value: [30 * 10000, 50 * 10000].toString() },
                    { label: '50~100', value: [50 * 10000, 100 * 10000].toString() },
                    { label: '100~500', value: [100 * 10000, 500 * 10000].toString() }
                  ]}
                />
              </Form.Item>
              <Form.Item label="回款" name="paymentReceived" className="mr-4">
                <Select
                  style={formItemStyle}
                  allowClear
                  placeholder="请选择回款金额"
                  options={[
                    { label: '30~50', value: [30 * 10000, 50 * 10000].toString() },
                    { label: '50~100', value: [50 * 10000, 100 * 10000].toString() },
                    { label: '100~150', value: [100 * 10000, 150 * 10000].toString() },
                    { label: '150~200', value: [150 * 10000, 200 * 10000].toString() },
                    { label: '200~250', value: [200 * 10000, 250 * 10000].toString() },
                    { label: '250~300', value: [250 * 10000, 300 * 10000].toString() },
                    { label: '300~350', value: [300 * 10000, 350 * 10000].toString() },
                    { label: '350~400', value: [350 * 10000, 400 * 10000].toString() },
                    { label: '400~450', value: [400 * 10000, 450 * 10000].toString() },
                    { label: '450~500', value: [450 * 10000, 500 * 10000].toString() }
                  ]}
                />
              </Form.Item>
            </div>
          </>
        )}
      </Form>
      {hasResult && (
        <div
          className="w-full mt-5"
          style={{
            height: 'calc(100vh - 165px)',
            overflow: 'scroll'
          }}
        >
          <Table
            bordered
            pagination={{
              current: currentPage, // 当前页码
              pageSize: pageSize, // 每页条数
              total: dataSource.recordCount, // 总数据条数
              showSizeChanger: true, // 是否显示可以改变 pageSize 的选项
              pageSizeOptions: ['10', '20', '50', '100'], // 设置每页可以显示多少条
              showQuickJumper: true, // 是否可以快速跳转至某页
              showTotal: (total) => `共 ${total} 条` // 用于显示数据总量和当前数据顺序
            }}
            onChange={({ current, pageSize }) => {
              changePagination(current!, pageSize)
            }}
            dataSource={dataSource && dataSource.rows}
            rowKey="id"
            columns={columns()}
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}
    </ConfigProvider>
  )
}

export default SearchFrom
