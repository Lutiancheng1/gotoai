import { useState } from 'react'
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons'
import './index.css'
import { Empty, Form, Input, Modal, Select, Tooltip, UploadProps } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import Toast from '@/components/Toast'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useLocation, useNavigate } from 'react-router-dom'
import { addWish, WritingChildrenList, deleteWish, getWritingDetail, getHistoryList, getWritingCategoryList, getWishList, WritingCategory, getFilterWritingCategoryList } from '@/store/action/writingAction'
import { useMount } from 'ahooks'
import Loading from '@/components/loading'
import { useForm } from 'antd/es/form/Form'
import FormItem from 'antd/es/form/FormItem'
import TextArea from 'antd/es/input/TextArea'
type ReportCategory = string | 'myTemplate'
const myTemplateBgurls = [
  'tem13.ae70523d.png',
  'tem15.4ac441a1.png',
  'tem14.8582cfcc.png',
  'tem12.95ec5f5d.png',
  'tem25.948d121e.png',
  'tem22.d32c9d85.png',
  'tem23.2dd91448.png',
  'tem24.6fe522e1.png',
  'tem31.287b8a03.png',
  'tem34.166073b2.png',
  'tem32.bf79c6a8.png',
  'tem35.662233da.png',
  'tem44.3607f6e4.png',
  'tem42.ece61365.png',
  'tem43.45336e9a.png'
]

function getRandomTemplateImageUrl() {
  const randomIndex = Math.floor(Math.random() * myTemplateBgurls.length)
  return myTemplateBgurls[randomIndex]
}
const myDocBgUrls = ['tem53.fee9ac2a.png', 'tem54.2e4c2c9b.png', 'tem51.ffb785f3.png', 'tem52.4de918cc.png']
function getRandomImageUrl(urls: string[]): string {
  const randomIndex = Math.floor(Math.random() * urls.length)
  return urls[randomIndex]
}

export default function CreateDoc() {
  const [activeKey, setActiveKey] = useState<ReportCategory>('分析/研究')

  const [modal, contextHolder] = Modal.useModal()
  // 新建文档的显示隐藏
  const [visible, setVisible] = useState(false)
  // 新建文档name
  const [docName, setDocName] = useState('')
  // 选中的模板
  const [selectedTemplate, setSelectedTemplate] = useState<WritingChildrenList>()
  // 重命名字段
  const [rename, setRename] = useState('')
  // 重命名modal显示
  const [renameModal, setRenameModal] = useState(false)
  const [form] = useForm()
  const dispatch = useAppDispatch()
  const WritingData = useAppSelector((state) => state.writingSlice)
  const location = useLocation()
  // 初始化数据
  useMount(async () => {
    if (Object.keys(WritingData.filteredCategory).length === 0) {
      dispatch(getFilterWritingCategoryList())
      dispatch(getWishList())
      dispatch(getHistoryList())
    }
  })
  // 收藏 / 取消收藏
  const handleCollect = (item: WritingChildrenList, collect: 0 | 1) => {
    if (collect === 1) {
      return dispatch(deleteWish(item))
    }
    dispatch(addWish(item))
  }
  const closeRenameModal = () => {
    setRenameModal(false)
    setRename('')
  }
  const reNmaeTemplate = () => {
    closeRenameModal()
  }
  const deleteTemplate = () => {
    modal.confirm({
      title: '提示',
      content: '确认要删除该模板吗?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      maskClosable: true,
      onOk() {
        Toast.notify({ type: 'success', message: '删除成功' })
      }
    })
  }
  const createDoc = async () => {
    if (docName.trim() === '') return Toast.notify({ type: 'info', message: '请输入文档名称' })
    const values = form.getFieldsValue()
    // 遍历 values 对象
    for (let key in values) {
      // 如果某一项没有值，就取它的默认值
      if (!values[key]) {
        const matchedItem = selectedTemplate && selectedTemplate.list.find((item) => item.input_name === key)
        // 如果找到了匹配的项，就使用这一项的 default 值
        if (matchedItem) {
          form.setFieldsValue({
            [key]: matchedItem.default
          })
        }
      }
    }

    console.log(docName, selectedTemplate, form.getFieldsValue())
    await setVisible(false)
    setDocName('')
    Toast.notify({ type: 'success', message: '创建成功' })
    setTimeout(() => {
      window.open(`docDetail/${new Date().getTime()}`)
    }, 100)
  }
  const props: UploadProps = {
    name: 'file',
    accept: '.doc,.docx',
    async beforeUpload(file) {
      const isWord = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword'
      if (!isWord) {
        Toast.notify({ type: 'error', message: '只能上传Word文件 (.doc 或 .docx)' })
        return false
      }
      return true
    },
    showUploadList: false,
    onDrop(e) {
      const file = e.dataTransfer.files[0]
      const isWord = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword'
      if (!isWord) {
        Toast.notify({ type: 'error', message: '只能上传Word文件 (.doc 或 .docx)' })
        return false
      }
      return true
    },
    customRequest(options) {
      const { file } = options
      console.log(file)
    }
  }
  return (
    <div className={`w-full h-full bg-white create_doc ${activeKey !== 'myTemplate' ? '' : 'pr-0'} p-4`}>
      {contextHolder}
      {/* 新建文档 */}
      <Modal
        title={selectedTemplate ? `新建文档 「 ${selectedTemplate.nickname} 」` : '新建文档'}
        open={visible}
        onOk={createDoc}
        width={650}
        onCancel={() => {
          setVisible(false)
          setDocName('')
          form.resetFields()
        }}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <div className="p-4">
          <div className="required w-14 mb-2">名称</div>
          <div className="flex justify-center items-center mb-2">
            <Input
              placeholder="请输入文档名称"
              value={docName}
              onChange={(e) => {
                setDocName(e.target.value)
              }}
            />
          </div>
          <Form autoComplete="off" layout="vertical" form={form}>
            {selectedTemplate &&
              selectedTemplate.list &&
              selectedTemplate.list.length > 0 &&
              selectedTemplate.list.map((item) => {
                return (
                  <div key={item.title}>
                    {item.input_type.startsWith('text') && (
                      <FormItem label={item.title} name={item.input_name}>
                        <TextArea className="prompt-textarea" placeholder={item.placeholder} showCount maxLength={parseInt(item.input_type.split('_')[1])} autoSize={{ minRows: Math.min(Math.ceil(parseInt(item.input_type.split('_')[1]) / 15), 4) }} />
                      </FormItem>
                    )}
                    {item.input_type.startsWith('select') && (
                      <FormItem label={item.title} name={item.input_name} initialValue={item.default || item.option?.[0]}>
                        <Select options={item.option?.map((option) => ({ label: option, value: option }))} />
                      </FormItem>
                    )}
                    {item.input_type.startsWith('tab') && (
                      <FormItem label={item.title} name={item.input_name} initialValue={item.default}>
                        <Select mode="tags" style={{ width: '100%' }} placeholder={item.placeholder} open={false} suffixIcon={null} notFoundContent={null} showSearch={false} maxCount={20} />
                      </FormItem>
                    )}
                  </div>
                )
              })}
          </Form>
        </div>
      </Modal>
      {/* 重命名模版 */}
      <Modal title="重命名" open={renameModal} onOk={reNmaeTemplate} width={650} onCancel={closeRenameModal} okText="确认" cancelText="取消" destroyOnClose>
        <div className="h-[100px] p-4">
          <div className="flex justify-center items-center">
            <span className="required w-14">名称</span>
            <Input
              placeholder="请输入文档名称"
              value={rename}
              onChange={(e) => {
                setRename(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>
      {Object.keys(WritingData.filteredCategory).length === 0 && (
        <div id="mask" className="opacity-80" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <Loading />
        </div>
      )}
      {WritingData.filteredCategory && WritingData.history && WritingData.history.list && WritingData.filteredCategory.length > 0 && WritingData.history.list.length > 0 && (
        <>
          {/*分类 */}
          <div className="doc-type mb-[30px]">
            {WritingData.filteredCategory &&
              WritingData.filteredCategory.map((item) => {
                return (
                  <span
                    key={item.id}
                    className={`type-item cursor-pointer mr-3 px-4 py-2 ${item.title === activeKey ? 'isActive' : ''}`}
                    onClick={() => {
                      setActiveKey(item.title as ReportCategory)
                    }}
                  >
                    {item.title}
                  </span>
                )
              })}
            <span
              key={'myTemplate'}
              className={`type-item cursor-pointer mr-3 px-4 py-2 ${'myTemplate' === activeKey ? 'isActive' : ''}`}
              onClick={() => {
                setActiveKey('myTemplate')
              }}
            >
              我的模版
            </span>
          </div>
          {/*  我的模版 */}
          <div
            className="w-full h-[calc(100%-35px)] pr-4 mr-4 overflow-y-auto nw-scrollbar"
            style={{
              display: activeKey === 'myTemplate' ? '' : 'none'
            }}
          >
            <div>
              <div className="mb-4 border-b py-2">
                我的上传
                <Tooltip
                  title={
                    <>
                      <p>1.标题格式：使用正确的一级、二级、三级标题。 </p>
                      <p> 2.概述内容：标题外的文本将自动解析为概述。 </p>
                    </>
                  }
                >
                  <QuestionCircleOutlined className="ml-1 text-[#999] text-[12px] " />
                </Tooltip>
              </div>
              <div className="templates-grid">
                <Dragger className="h-[150px]" {...props}>
                  <div>
                    <PlusOutlined />
                  </div>
                  <div>上传模版</div>
                </Dragger>
                {Array.from({ length: 6 }).map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="template-item group relative"
                      onClick={() => {
                        setSelectedTemplate(undefined)
                        setDocName('模板' + index)
                        setVisible(true)
                      }}
                      style={{
                        backgroundImage: `url(https://aidoc.cnki.net/idoc/static/img/${getRandomImageUrl(myDocBgUrls)})`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/*  删除 */}
                      <span title="删除" className="absolute right-2 top-2 cursor-pointer w-6 h-6 rounded-lg bg-white justify-center items-center hidden group-hover:flex">
                        <i
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTemplate()
                          }}
                          className={`iconfont icon-shanchu1 text-[#BBB] hover:text-[#444] `}
                        />
                      </span>
                      {/* 编辑 */}
                      <span title="编辑" className="absolute right-9 top-2 cursor-pointer w-6 h-6 rounded-lg bg-white justify-center items-center hidden group-hover:flex">
                        <i
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className={`iconfont icon-zhongmingming text-[#BBB] hover:text-[#444] `}
                        />
                      </span>
                      <span className="template-name ml-5 w-[calc(100%-125px)] !text-[16px] line-clamp-2" title="OpenAI 企业级应用开发指南">
                        {'OpenAI 企业级应用开发指南calc(100% - 105px)' + index}
                      </span>
                      {/* 重命名 */}
                      <i
                        title="重命名"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenameModal(true)
                          setRename('模板' + index)
                        }}
                        className={`iconfont icon-bianji text-[#BBB] hover:text-[#444] !text-[18px] hidden group-hover:flex`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="mb-4 border-b py-2">我的收藏</div>
              {WritingData.filteredCategory && WritingData.wish && WritingData.wish.list && WritingData.wish.list.length > 0 && WritingData.filteredCategory.length > 0 ? (
                <div className="templates-grid">
                  {WritingData.wish.list.map((list) => {
                    return (
                      <div
                        key={list.id}
                        className="template-item group relative"
                        onClick={() => {
                          setVisible(true)
                          setSelectedTemplate(list)
                        }}
                        style={{
                          backgroundImage: `url(https://aidoc.cnki.net/idoc/static/img/${getRandomTemplateImageUrl()})`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center'
                        }}
                      >
                        <span className="absolute right-2 top-2 cursor-pointer w-6 h-6 rounded-lg bg-white justify-center items-center hidden group-hover:flex">
                          <i
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCollect(list, list.is_wish)
                            }}
                            className={`iconfont ${list.is_wish === 1 ? 'icon-shoucang-active text-[#FFD400]' : 'icon-shoucang text-[#BBB] hover:text-[#444]'}`}
                          />
                        </span>
                        <span className="template-name ml-5"> {list.nickname}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty />
              )}
            </div>
            <div>
              <div className="mb-4 border-b py-2">最近常用</div>
              {WritingData.filteredCategory && WritingData.history && WritingData.history.list && WritingData.filteredCategory.length > 0 && WritingData.history.list.length > 0 ? (
                <div className="templates-grid">
                  {WritingData.history.list.map((list) => {
                    return (
                      <div
                        key={list.id}
                        className="template-item group relative"
                        onClick={() => {
                          setVisible(true)
                          setSelectedTemplate(list)
                          form.resetFields()
                        }}
                        style={{
                          backgroundImage: `url(https://aidoc.cnki.net/idoc/static/img/${getRandomTemplateImageUrl()})`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center'
                        }}
                      >
                        <span className="absolute right-2 top-2 cursor-pointer w-6 h-6 rounded-lg bg-white justify-center items-center hidden group-hover:flex">
                          <i
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCollect(list, list.is_wish)
                            }}
                            className={`iconfont ${list.is_wish === 1 ? 'icon-shoucang-active text-[#FFD400]' : 'icon-shoucang text-[#BBB] hover:text-[#444]'}`}
                          />
                        </span>
                        <span className="template-name ml-5"> {list.nickname}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty />
              )}
            </div>
          </div>
          {/* 分类 */}
          <div
            className="w-full h-[calc(100%-35px)]"
            style={{
              display: activeKey !== 'myTemplate' ? '' : 'none'
            }}
          >
            <div className="templates-grid">
              {WritingData.filteredCategory &&
                WritingData.filteredCategory.map((item, index) => {
                  if (item.list.length === 0) return null
                  if (item.title === activeKey) {
                    return item.list.map((list, i) => {
                      return (
                        <div
                          key={list.id || i}
                          onClick={() => {
                            setVisible(true)
                            setSelectedTemplate(list)
                          }}
                          className="template-item group relative"
                          style={{
                            backgroundImage: `url(https://aidoc.cnki.net/idoc/static/img/${getRandomTemplateImageUrl()})`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                          }}
                        >
                          <span className="absolute right-2 top-2 cursor-pointer w-6 h-6 rounded-lg bg-white justify-center items-center hidden group-hover:flex">
                            <i
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCollect(list, list.is_wish)
                              }}
                              className={`iconfont ${list.is_wish === 1 ? 'icon-shoucang-active text-[#FFD400]' : 'icon-shoucang text-[#BBB] hover:text-[#444]'}`}
                            />
                          </span>
                          <span className="template-name ml-5">{list.nickname}</span>
                        </div>
                      )
                    })
                  } else {
                    return null
                  }
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
