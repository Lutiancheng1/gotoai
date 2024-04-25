import { SetStateAction, useEffect, useRef, useState } from 'react'
import './index.css'
import { Button, ConfigProvider, Input, InputNumber, InputNumberProps, List, Select, Switch, Tabs, Tooltip, Upload, UploadProps, Popconfirm, Tag, Modal, Pagination, Card, Slider, message, UploadFile, GetProp } from 'antd'
import { InfoCircleOutlined, UploadOutlined, DownloadOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import Toast, { useToastContext } from '@/components/Toast'
import TextArea from 'antd/es/input/TextArea'
import { useBoolean, useMount, useRequest, useUnmount, useUpdateEffect } from 'ahooks'
import MJIcon from '@/assets/images/mj.jpg'
import NIJIIcon from '@/assets/images/niji.jpg'
import { ITab, pictureRatioWarp, modelVersions, qualityLevels, tabs, tabsWarp, modalWarp, stylizationWarp, stylesWarp } from './constant'
import { getTaskList, getTaskQueue, submitDrawChange, submitDrawImagine } from '@/api/midijourney'
import axios from 'axios'
import { MD5 } from '@/utils/md5'
import { dateFormat, randString } from '@/utils/libs'
import { UploadRequestOption, UploadRequestError } from 'rc-upload/lib/interface'
import Loading from '@/components/loading'
import errorIcon from '@/assets/images/error.png'
import { RcFile } from 'antd/es/upload'
export interface Property {
  notifyHook?: any
  discordInstanceId: string
  flags: number
  messageId: string
  messageHash: string
  nonce: string
  finalPrompt: string
  progressMessageId: string
}

export interface TaskList {
  id: string
  properties: Property
  action: 'UPSCALE' | 'VARIATION' | 'REROLL' | 'IMAGINE'
  status: string
  prompt: string
  promptEn: string
  description: string
  state: string
  submitTime: number
  startTime: number
  finishTime: number
  imageUrl: string
  progress: string
  failReason?: string
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

const DrawDesigns = () => {
  // 大模型
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentRootModel, setCurrentRootModel] = useState('Midjourney')
  // 次分类
  const [currentTab, setCurrentTab] = useState<ITab>('imageCreation')
  // 当前模型 MJ NIJI
  const [currentModel, setCurrentModel] = useState<'MJ' | 'NIJI'>('MJ')
  // 图片比例
  const [pictureRatio, setPictureRatio] = useState(pictureRatioWarp[2].value)
  // 图像质量 风格化
  const [stylization, setStylization] = useState(250)
  // 当前风格
  const [currentStyle, setCurrentStyle] = useState(stylesWarp[0].value)
  // 当前版本
  const [currentVersion, setCurrentVersion] = useState(modelVersions[currentModel][0].value)
  // RAW
  const [raw, { toggle: toggleRaw, setTrue: setTrueRaw }] = useBoolean(true)
  // 重复
  const [repeate, { toggle: toggleRepeate, setFalse: setFalseRepeate }] = useBoolean(false)
  // 画质
  const [quality, setQuality] = useState(qualityLevels[0].value)
  // 混乱
  const [confusion, setConfusion] = useState(1)
  // 是否携带参数
  const [withParams, { toggle: toggleWithParams, setTrue: setTrueWithParams, set: setWithParams }] = useBoolean(true)
  // 提示词
  const [prompt, setPrompt] = useState('')
  // 忽略元素
  const [ignoreElements, setIgnoreElements] = useState('')
  // 记录左侧控制烂收起折叠
  const [isFold, setIsFold] = useState(false)
  const controllerRef = useRef<HTMLDivElement>(null)
  // taskList
  const [taskList, setTaskList] = useState<TaskList[]>([])
  // 当前正在进行任务队列
  const [TaskQueueList, setTaskQueueList] = useState<TaskList[]>([])
  // 创建按钮loading
  const [submitLoading, setSubmitLoading] = useState(false)
  // prompt中 是否有参数
  const [withParamsPrompt, setWithParamsPrompt] = useState(false)
  const regexp = /--(?:version|aspect|ar|quality|q|chaos|c|stylize|s|raw|fast|iw|no|style|relax|repeat|seed|stop|turbo|video|weird|iw)/
  // loading
  const [isLoading, setIsLoading] = useState(true)
  // 分页
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  // 以图生图modal显示隐藏
  const [isShowTsT, setIsShowTsT] = useState(false)
  // 图生图 权重
  const [weights, setWeights] = useState(1)
  // base64图片数组
  const [base64List, setBase64List] = useState<UploadFile[]>([])
  // 预览visible
  const [previewVisible, setPreviewVisible] = useState(false)
  // 预览图片
  const [previewImage, setPreviewImage] = useState('')

  // 计算列数
  const calculateSpan = () => {
    if (window.innerWidth > 2100) {
      return 2
    } else if (window.innerWidth > 1600) {
      return 3
    } else if (window.innerWidth > 1200) {
      return 4
    } else if (window.innerWidth > 900) {
      return 6
    } else {
      return 12
    }
  }

  const [columnSpan, setColumnSpan] = useState(calculateSpan())
  //  设置列数
  useEffect(() => {
    const handleResize = () => {
      setColumnSpan(calculateSpan())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const menuClick = (key: ITab) => {
    console.log(key, 'key')
    setCurrentTab(key)
    setIsFold(false)
  }
  const promptChange = (value: string) => {
    setPrompt(value)
    const flag = regexp.test(value)
    setWithParams(!flag)
  }
  //
  const setUsedPromot = (prompt: string) => {
    setPrompt(prompt)
    setWithParamsPrompt(true)
  }
  // 重置默认参数
  const resetParams = () => {
    // 重置图片比例
    setPictureRatio(pictureRatioWarp[2].value)
    // 重置模型
    setCurrentModel('MJ')
    // 重置风格
    setCurrentStyle(stylesWarp[0].value)
    // 重置当前绘画版本
    setCurrentVersion(modelVersions[currentModel][0].value)
    // 重置RAW
    setTrueRaw()
    // 重置重复
    setFalseRepeate()
    // 重置画质
    setQuality(qualityLevels[0].value)
    // 重置混乱
    setConfusion(1)
    // 重置风格化
    setStylization(250)
    // 重置是否携带参数
    setTrueWithParams()
  }
  const usePolling = () => {
    const pollingTaskQueueInterval = useRef<NodeJS.Timeout | null>(null)
    const pollingTaskListInterval = useRef<NodeJS.Timeout | null>(null)

    const { data: taskQueueData, runAsync: getTaskQueueList } = useRequest(getTaskQueue, {
      manual: true
    })

    const { runAsync: getTaskListData } = useRequest(getTaskList, {
      manual: true
    })

    // 开始轮询任务队列
    const startPollingTaskQueue = () => {
      if (pollingTaskQueueInterval.current === null) {
        pollingTaskQueueInterval.current = setInterval(async () => {
          const data = await getTaskQueueList()
          if (data) {
            setTaskQueueList(data)
            if (data.length === 0 || data.every((task) => task.progress === '100%')) {
              stopPollingTaskQueue() // 队列为空时停止轮询任务队列
              stopPollingTaskList()
              getTaskList()
            } else {
              startPollingTaskList() // 开始轮询任务列表
            }
          } else {
            stopPollingTaskQueue()
            stopPollingTaskList()
          }
        }, 7500) // 每5秒轮询一次任务队列
      }
    }

    // 停止轮询任务队列
    const stopPollingTaskQueue = () => {
      if (pollingTaskQueueInterval.current) {
        clearInterval(pollingTaskQueueInterval.current)
        pollingTaskQueueInterval.current = null
      }
    }

    // 开始轮询任务列表
    const startPollingTaskList = () => {
      if (pollingTaskListInterval.current === null) {
        pollingTaskListInterval.current = setInterval(async () => {
          const data = await getTaskListData()
          if (data) {
            setTaskList(data)
            if (data.filter((task) => task.status !== 'FAILURE').every((task) => task.progress === '100%')) {
              setTaskQueueList([])
              stopPollingTaskList()
              stopPollingTaskQueue()
              getTaskList()
            }
          }
        }, 4000) // 每2秒轮询一次任务列表
      }
    }

    // 停止轮询任务列表
    const stopPollingTaskList = () => {
      if (pollingTaskListInterval.current) {
        clearInterval(pollingTaskListInterval.current)
        pollingTaskListInterval.current = null
      }
    }

    useUnmount(() => {
      // 组件卸载时清理轮询
      stopPollingTaskQueue()
      stopPollingTaskList()
    })

    return {
      startPollingTaskQueue,
      stopPollingTaskQueue,
      startPollingTaskList,
      stopPollingTaskList,
      taskQueueData
    }
  }

  // 使用usePolling
  const { startPollingTaskQueue, stopPollingTaskQueue, startPollingTaskList } = usePolling()

  const inputNumberonChange: InputNumberProps['onChange'] = (value) => {
    setStylization(value as number)
  }
  const toggleIsFold = () => {
    if (!controllerRef.current) return
    controllerRef.current.style.display = isFold ? 'block' : 'none'
    // 动画
    setIsFold(!isFold)
  }
  // 创建任务
  const createTask = async () => {
    console.log('创建任务')
    setSubmitLoading(true)
    let resultPrompt = ''
    resultPrompt += `${prompt} `
    if (currentModel === 'MJ') {
      resultPrompt += `--version ${currentVersion} --aspect ${pictureRatio} --stylize ${stylization} --quality ${quality} --chaos ${confusion} ${raw ? '--style raw' : ''} ${ignoreElements ? `--no ${ignoreElements}` : ''} ${repeate ? '--tile' : ''} ${base64List.length > 0 ? '--iw ' + weights : ''}`
    } else {
      resultPrompt += `--niji ${currentVersion} --aspect ${pictureRatio} --stylize ${stylization} --quality ${quality} --chaos ${confusion} ${currentStyle ? `--style ${currentStyle}` : ''} ${ignoreElements ? `--no ${ignoreElements}` : ''} ${base64List.length > 0 ? '--iw ' + weights : ''}`
    }
    if (!withParams) {
      resultPrompt = prompt
    }

    try {
      const res = (await submitDrawImagine({
        prompt: resultPrompt,
        base64Array: base64List.length > 0 ? (base64List.map((item) => item.url) as [string]) : [],
        notifyHook: '',
        state: '',
        botType: 'MID_JOURNEY'
      })) as unknown as {
        code: number
        msg: string
        data: TaskList
      }
      setPrompt('')
      setIgnoreElements('')
      setSubmitLoading(false)
      setBase64List([])
      if (res.code === 1) {
        await getTaskQueueList()
      }
    } catch (error) {
      console.log(error)
      Toast.notify({ type: 'error', message: '创建任务失败' })
      setSubmitLoading(false)
    }
  }
  //  删除任务
  const delTask = (id: string) => {
    // console.log(id)
  }
  // 下载图片
  const downloadImage = async (url: string) => {
    if (!url) return
    try {
      const response = await fetch(url) // 替换为你的图片 URL
      if (!response.ok) {
        return Toast.notify({ type: 'error', message: '下载失败' })
      }
      const blob = await response.blob()
      const path = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = path
      link.download = 'image.jpg' // 替换为你想要的文件名
      link.click()
      // 移除按钮
      link.remove()
      // 释放内存
      URL.revokeObjectURL(url)
      Toast.notify({ type: 'success', message: '下载成功,请查看浏览器下载页' })
    } catch (error) {
      Toast.notify({ type: 'error', message: '下载失败' })
      console.error(error)
    }
  }
  // Save JSON
  const downloadJson = async () => {
    try {
      const formattedTaskList = taskList
        .filter((task) => task.status !== 'FAILURE')
        .map((task) => ({
          actionTypeName: task.action || '',
          prompt: task.prompt || '',
          promptEn: task.promptEn || null,
          imageUrl: task.imageUrl || null,
          statusName: task.status || '',
          createTime: task.startTime || ''
        }))
      const jsonString = JSON.stringify(formattedTaskList, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'drawer-data.json'
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      Toast.notify({ type: 'success', message: 'JSON下载成功,请查看浏览器下载页' })
    } catch (error) {
      Toast.notify({ type: 'error', message: '保存JSON失败' })
      console.error(error)
    }
  }
  const changePagination = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    setPageSize(pageSize || 12)
  }
  const getTaskLists = async () => {
    setIsLoading(true)
    const data = await getTaskList()
    setIsLoading(false)
    if (!data) return
    setTaskList(data)
    if (data.some((task) => task.status !== 'FAILURE' && task.progress !== '100%')) {
      // 有任务进行中 开始监听
      startPollingTaskList()
      startPollingTaskQueue()
    }
  }
  const getTaskQueueList = async () => {
    const data = await getTaskQueue()
    if (data.length === 0) {
      return
    }
    setTaskQueueList(data)
    startPollingTaskQueue()
    startPollingTaskList()
  }
  // 变换图片
  const changeImagine = async (action: 'U' | 'V' | 'R', taskId: string, index?: number) => {
    const actionWarp = {
      U: 'UPSCALE',
      V: 'VARIATION',
      R: 'REROLL'
    } as { [key: string]: 'UPSCALE' | 'VARIATION' | 'REROLL' }
    Modal.confirm({
      title: '提示',
      content: index ? `是否${action === 'U' ? '放大' : '变换'}第${index}张图片?` : '是否重新生成该组图片?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'primary',
      maskClosable: true,
      async onOk() {
        const data = await submitDrawChange({
          action: actionWarp[action],
          index,
          taskId
        })
        if (data.code === 1) {
          startPollingTaskList()
          startPollingTaskQueue()
        }
      }
    })

    console.log(action, taskId, index)
  }

  // 初始化获取任务队列列表
  useMount(async () => {
    await getTaskLists()
  })
  useUpdateEffect(() => {
    const shouldSetWithParamsPrompt = !withParams || regexp.test(prompt)

    if (withParamsPrompt !== shouldSetWithParamsPrompt) {
      setWithParamsPrompt(shouldSetWithParamsPrompt)
    }

    if (shouldSetWithParamsPrompt) {
      setWithParams(false)
    }
  }, [prompt, withParams])

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewVisible(true)
  }

  const beforeUpload = (file: FileType) => {
    const isImage = /^image\//.test(file.type)
    if (!isImage) {
      Toast.notify({ type: 'error', message: '请上传图片' })
    }
    return isImage
  }
  const customRequest = async ({ file }: UploadRequestOption) => {
    const f = file as RcFile
    const res = (await getBase64(f)) as string
    if (res) {
      setBase64List([
        ...(base64List as []),
        {
          url: res,
          name: f.name,
          status: 'done',
          uid: f.uid
        }
      ])
    }
  }
  const onRemove = (file: UploadFile) => {
    setBase64List(base64List.filter((item) => item.uid !== file.uid))
  }
  return (
    <div className="drawDesigns">
      {/* 上方tab切换*/}
      <section className="draw-tabs bg-white flex justify-start">
        {/* 两个模型 Midjourney  |  Stable Diffusion */}
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                /* 这里是你的组件 token */
                inkBarColor: '#dcddde',
                itemActiveColor: '',
                itemSelectedColor: '',
                itemHoverColor: ''
              }
            }
          }}
        >
          <Tabs
            defaultActiveKey={currentRootModel}
            items={[
              {
                label: 'Midjourney',
                key: 'Midjourney',
                children: (
                  <div className="Midjourney">
                    <div className="draw-controller-item-title">
                      <ul className="action menu menu-vertical lg:menu-horizontal rounded-box">
                        {tabs.map((item) => {
                          return (
                            <li className="mr-2" key={item} onClick={() => menuClick(item as ITab)}>
                              <button className={`${item === currentTab ? 'active' : ''}`}>{tabsWarp[item]} </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                label: 'Stable Diffusion',
                key: 'Stable Diffusion',
                children: <div className="StableDiffusion"></div>,
                disabled: true
              }
            ]}
          />
        </ConfigProvider>
      </section>
      {/* 以图生图modal */}
      <Modal title="以图生图" open={isShowTsT} onOk={() => setIsShowTsT(false)} width={650} onCancel={() => setIsShowTsT(false)} okText="确认" cancelText="取消">
        <div className="text-sm p-3">
          <p>1、图片越相似，生成角色越精准，最多 2 张图片</p>
          <p>2、图片顺序越前，权重越高，建议把你最喜欢的图片放在最前面</p>
          <p>3、生成权重：描述，生成偏向描述词；图片，生成偏向参考图</p>
        </div>
        <div className="p-4">
          <div>生成权重：</div>
          <Slider className="pl-4" min={0.5} max={2} step={0.1} marks={{ 0.5: '描述', 1: '平衡', 2: '图片' }} value={weights} onChange={setWeights} />
        </div>
        <div className="p-2 flex">
          <div>上传图片：</div>
          <div>
            <Upload beforeUpload={beforeUpload} customRequest={customRequest} listType="picture-card" fileList={base64List} onPreview={handlePreview} onRemove={onRemove}>
              {base64List && base64List.length >= 2 ? null : <UploadOutlined />}
            </Upload>
            <Modal title="查看图片" open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
              <img alt="" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </div>
      </Modal>
      {/* container */}
      <section className="draw-container w-full h-full flex overflow-hidden">
        {currentTab === 'imageCreation' && (
          <>
            <div className="relative bg-white" style={{ borderRight: '1px solid rgb(229, 231, 235)' }}>
              <div className="draw-controller w-[210px] p-3" ref={controllerRef}>
                {/* 图片比例 */}
                <div className="picture_ratio mb-4">
                  <div className="mb-2 flex items-center text-sm">
                    <div className="mr-1">图片比例</div>
                    <Tooltip
                      title={
                        <>
                          <p> --aspect,或--ar更改生成的纵横比.</p>
                          <p>参数释义：生成图片尺寸比例</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                  <div className="aspect flex items-center justify-between space-x-1">
                    {pictureRatioWarp.map((item, index) => {
                      return (
                        <button className={`aspect-item flex-1 rounded border-2 dark:border-neutral-700 ${pictureRatio === item.label ? 'active' : ''}`} key={index} onClick={() => setPictureRatio(item.label)}>
                          <div className="aspect-box-wrapper mx-auto my-2 flex h-5 w-5 items-center justify-center">
                            <div className="aspect-box rounded border-2 dark:border-neutral-700" style={{ width: item.w + '%', height: item.h + '%' }} />
                          </div>
                          <p className="mb-1 text-center text-xs">{item.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* 模型选择 */}
                <div className="model mb-4">
                  <div className="mb-2 flex items-center text-sm">
                    <div className="mr-1">模型选择</div>
                    <Tooltip
                      title={
                        <>
                          <p>MJ：通用模型 </p>
                          <p>NIJI：动漫风格模型</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                  <ul className="model space-x-2 flex justify-center items-center">
                    {modalWarp.map((item) => {
                      return (
                        <li
                          className={`model-item ${currentModel === item ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentModel(item)
                            setCurrentVersion(modelVersions[currentModel][0].value)
                          }}
                          key={item}
                        >
                          <button className="relative overflow-hidden rounded-md border-4 dark:border-neutral-700">
                            <span className="absolute flex h-full w-full items-center justify-center bg-black/20">
                              <span className="text-lg font-bold text-white">{item}</span>
                            </span>
                            <img className="h-full w-full object-cover" src={item === 'MJ' ? MJIcon : NIJIIcon} alt={item} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                {/* 版本 */}
                <div className="version flex items-center mb-4 justify-between">
                  <div>版本</div>
                  <Select
                    value={currentVersion}
                    style={{ width: 120 }}
                    onChange={(value) => {
                      setCurrentVersion(value)
                      // 重置风格
                      setCurrentStyle(stylesWarp[0].value)
                    }}
                    options={modelVersions[currentModel]}
                    allowClear={false}
                  />
                </div>
                {/* RAW NIJI不许有该参数 */}
                {currentModel === 'MJ' && (
                  <div className="RAW flex items-center mb-4 justify-between">
                    <div>RAW</div>
                    <Switch className="bg-gray-500" value={raw} onChange={toggleRaw} />
                    <Tooltip title="呈现的人物写实感更加逼真人物细节、光源、流畅度也更加接近原始作品">
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                )}
                {/* 重复 NIJI不许有该参数 */}
                {currentModel === 'MJ' && (
                  <div className="repeat flex items-center mb-4 justify-between">
                    <div>重复</div>
                    <Switch className="bg-gray-500" value={repeate} onChange={toggleRepeate} />
                    <Tooltip
                      title={
                        <>
                          <p>重复：--tile</p>
                          <p>参数释义：生成可用作重复平铺的图像，以创建无缝图案。</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                )}
                {/* 风格  NIJI独有*/}
                {currentModel === 'NIJI' && (
                  <div className="style flex items-center mb-4 justify-between">
                    <div>风格</div>
                    <Select disabled={currentVersion === 6} value={currentStyle} style={{ width: 120 }} onChange={(value) => setCurrentStyle(value)} options={stylesWarp} allowClear={false} />
                  </div>
                )}
                {/* 参数 */}
                <div className="parameter flex items-center justify-between">
                  <div className="mb-4 flex items-center text-sm">
                    <div className="mr-1">参数</div>
                    <Tooltip title="设定绘画模型参数">
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                </div>
                {/* 画质 */}
                <div className="picture_quality flex items-center mb-4 justify-between">
                  <div>画质</div>
                  <Select value={quality} style={{ width: 100 }} onChange={setQuality} options={qualityLevels} />
                  <Tooltip
                    title={
                      <>
                        <p>画质：--quality 或 --q</p>
                        <p>参数释义：更高质量需要更长的时间处理更多细节</p>
                      </>
                    }
                  >
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                </div>
                {/* 混乱 */}
                <div className="confusion flex items-center mb-4 justify-between">
                  <div>混乱</div>
                  <InputNumber min={1} style={{ width: 100 }} max={100} value={confusion} onChange={(value) => setConfusion(value!)} />
                  <Tooltip title="混乱：--chaos 或 --c，范围 0-100参数释义：较高值将产生意想不到的结果和成分较低值具有更可靠、可重复的结果">
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                </div>
                {/* 风格化 */}
                <div className="parameter flex items-center justify-between">
                  <div className="mb-4 flex items-center text-sm">
                    <div className="mr-1">风格化</div>
                    <Tooltip
                      title={
                        <>
                          <p>风格化: --stylize 或 --s,范围 1-1000</p>
                          <p>参数释义：数值越高，画面表现也会更具丰富性和艺术性</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                </div>
                <div className="flex justify-around mb-2">
                  {stylizationWarp.map((item) => {
                    return (
                      <Button type="default" className={stylization === item.value ? 'bg-[#1890ff] text-white' : ''} size="small" onClick={() => setStylization(item.value)} key={item.label}>
                        {item.label}
                      </Button>
                    )
                  })}
                </div>
                <div className="w-full mb-4">
                  <InputNumber style={{ width: '100%' }} min={1} max={1000} value={stylization} defaultValue={250} onChange={inputNumberonChange} />
                </div>
                {/* 设定 */}
                <div className="setup flex items-center mb-4 justify-between">
                  <div>设定</div>
                </div>
                <div className="carry_parameters flex items-center mb-4 justify-between">
                  <div>携带参数</div>
                  <Switch className="bg-gray-500" value={withParams} onChange={toggleWithParams} />
                  <Tooltip
                    title={
                      <>
                        <p>是否自动携带参数 </p>
                        <p>开启：使用设定参数 </p>
                        <p>关闭：可在提示词框自行设定参数</p>
                      </>
                    }
                  >
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                </div>
                {/* reset */}
                <div className="default flex items-center mb-4 ">
                  <div>默认参数</div>
                  <Popconfirm title="重置参数" description="是否重置参数为默认？" onConfirm={resetParams} okText="确认" okButtonProps={{ className: 'bg-[#1890ff] ' }} cancelText="取消">
                    <button className="btn btn-ghost btn-sm ml-4">重置</button>
                  </Popconfirm>
                </div>
              </div>
              {/* 折叠按钮 */}
              <div className="fold flex justify-center items-center w-[30px] h-[30px] cursor-pointer absolute " title="收起" style={{ right: 0, top: '50%', transform: 'translate(60%,-150%)', zIndex: 10 }} onClick={toggleIsFold}>
                <i className={`iconfont cursor-pointer ${!isFold ? 'icon-zhedie' : 'icon-zhankai'}`}></i>
              </div>
            </div>
            <div className="draw-content w-full p-4 overflow-y-auto">
              {/* 头部 */}
              <header className="mb-3">
                <div className="title text-lg">AI绘画</div>
                <div className="subtitle mb-2">基于Midjourney的AI绘画工具</div>
                <p className="mb-2">图生图：生成类似风格或类型图像</p>
                {/* 图生文：上传一张图片生成对应的提示词；融图：融合图片风格 */}
                <div className="btns">
                  <Button icon={<UploadOutlined />} type="primary" className="bg-blue-500" onClick={() => setIsShowTsT(true)}>
                    以图生图（可选）
                  </Button>
                  {/* <Upload {...props}>
                    <Button type="primary" className="bg-blue-500" icon={<UploadOutlined />}>
                      以图生文（可选）
                    </Button>
                  </Upload>
                  <Upload {...props}>
                    <Button type="primary" className="bg-blue-500" icon={<UploadOutlined />}>
                      融图（可选）
                    </Button>
                  </Upload> */}
                </div>
                {/* 预览 */}
                {!isShowTsT && base64List && base64List.length > 0 && (
                  //  圆角 边框
                  <div className="mt-4 p-4" style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                    <div className="mb-4">
                      <Button type="primary" onClick={() => setBase64List([])}>
                        清空参考图
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {base64List.map((item) => {
                        return (
                          <div className="flex flex-col items-center gap-2" key={item.url}>
                            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border p-1">
                              <img src={item.url} alt="" />
                            </div>
                            <Button color="#da8583" type="default" icon={<i className="iconfont icon-shanchu1"></i>} onClick={() => setBase64List(base64List.filter((i) => i.url !== item.url))} shape="circle"></Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </header>
              {/* 内容 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div>生成提示词 {withParamsPrompt ? '(提示词带有自定义参数，将不使用默认设定参数)' : ''}</div>
                <div></div>
              </div>
              <div className="textarea_con mb-2">
                <TextArea value={prompt} onChange={(e) => promptChange(e.target.value)} allowClear placeholder="例如：a cute cat（建议使用英文进行描述,支持中文,会自动翻译）" autoSize={{ minRows: 3, maxRows: 5 }} />
              </div>
              {/* 忽略元素 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div>忽略元素（可选）</div>
                <div></div>
              </div>
              <div className="ignore_element mb-4">
                <Input value={ignoreElements} onChange={(e) => setIgnoreElements(e.target.value)} allowClear placeholder="例如：生成一幅街景，但不要有汽车，你可以填写 car" />
              </div>
              {/* 预设 */}
              <div className="mb-4">
                <Button type="default" size="small" className="mr-2" onClick={() => setPrompt('a cute cat')}>
                  可爱的小猫
                </Button>
                <Button type="default" size="small" className="mr-2" onClick={() => setPrompt('a blue, girl with colorful hair, in the style of yanjun cheng, clowncore, 32k uhd, painted illustrations, close up, lively tableaus, kawaii art HD 8K')}>
                  蓝色动漫女孩
                </Button>
                <Button type="default" size="small" onClick={() => setPrompt('a little girl eating watermelon on a farm, by Maria Hernandez, unsplash, joyful expression, green fields, sunny day, bright colors, rustic atmosphere, wooden fence, straw hat, freckles, pure happiness, blissful moment')}>
                  吃西瓜小女孩
                </Button>
              </div>
              {/* 开始按钮 */}
              <div className="start mb-3">
                <Button loading={submitLoading} onClick={createTask} type="primary" disabled={!prompt.trim()} className=" bg-blue-500" icon={<i className="iconfont icon-a-Group3802"></i>}>
                  创建任务
                </Button>
              </div>
              {/* 当前任务 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">当前任务</div>
                <Button type="default" icon={<i className="iconfont icon-shuaxin"></i>} onClick={getTaskQueueList}>
                  刷新
                </Button>
              </div>
              <div>
                <List
                  size="small"
                  bordered
                  dataSource={TaskQueueList}
                  renderItem={() => (
                    <div className="flex h-36">
                      <div className="m-auto text-center">
                        <span className="loading loading-spinner loading-md"></span>
                        <div>
                          <p>当前 {TaskQueueList.length} 个进行中的任务，请耐心等待。</p>
                          <p>点击后台执行后，仍可手动刷新列表后进行查看...</p>
                          <p className="mt-2 flex justify-center">
                            <Button
                              type="default"
                              onClick={() => {
                                setTaskQueueList([])
                                stopPollingTaskQueue()
                              }}
                            >
                              后台执行
                            </Button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              {/* 任务列表 */}
              {/* 开始按钮 */}
              <div className="start mb-3"></div>
              {/* 任务列表 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">任务列表</div>
              </div>
              <div className="w-full flex justify-between items-center mb-2">
                <div>总记 : {taskList && taskList.length}</div>
                <div>
                  <Button className="mr-2" type="default" icon={<i className="iconfont icon-shuaxin"></i>} onClick={getTaskLists}>
                    刷新
                  </Button>
                  <Popconfirm title="保存绘画记录" description="保存当前页面绘画记录为本地 JSON ？" onConfirm={() => downloadJson()} okText="确认" okButtonProps={{ className: 'bg-[#1890ff] ' }} cancelText="取消">
                    <Button type="default" icon={<DownloadOutlined />}></Button>
                  </Popconfirm>
                </div>
              </div>
              {/* loading */}
              <div className="min-h-[922px] relative">
                <div className="space-y-4">
                  <main>
                    {isLoading && (
                      <div id="mask" className="w-full h-full opacity-30" style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}>
                        <div className="absolute" style={{ left: '50%', top: '20%', transform: 'translate(-50%, -20%)' }}>
                          <Loading></Loading>
                        </div>
                      </div>
                    )}
                    <div
                      className="n-grid"
                      style={{
                        display: 'grid',
                        gap: '12px',
                        gridTemplateColumns: 'repeat(12, minmax(0px, 1fr))',
                        width: '100%'
                      }}
                    >
                      {taskList &&
                        taskList.length > 0 &&
                        taskList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => {
                          return (
                            <div
                              style={{
                                gridColumn: `span ${columnSpan} / span ${columnSpan}`
                              }}
                              key={item.id}
                            >
                              <div className="h-full relative overflow-hidden rounded-md border p-4 transition-all hover:shadow dark:border-neutral-700">
                                <div className="flex items-center justify-between">
                                  <div className="n-tag __tag-dark-f4psvt-psc n-tag--round">
                                    {/* 任务状态: NOT_START（未启动）、SUBMITTED（已提交处理）、IN_PROGRESS（执行中）、FAILURE（失败）、SUCCESS（成功） */}
                                    <Tag
                                      color={
                                        {
                                          SUCCESS: '#87d068',
                                          IN_PROGRESS: '#1890ff',
                                          SUBMITTED: '#fadb14',
                                          NOT_START: '#d9d9d9',
                                          FAILURE: '#f5222d'
                                        }[item.status] || '#fadb14'
                                      }
                                    >
                                      {item.status === 'NOT_START' ? '未启动' : item.status === 'SUBMITTED' ? '已提交处理' : item.status === 'IN_PROGRESS' ? '执行中' : item.status === 'FAILURE' ? '失败' : '成功'}
                                    </Tag>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <ConfigProvider
                                      theme={{
                                        components: {
                                          Button: {
                                            /* 这里是你的组件 token */
                                            paddingInlineSM: 3,
                                            // paddingBlockSM: 0
                                            contentFontSizeSM: 12,
                                            onlyIconSizeSM: 12
                                          }
                                        }
                                      }}
                                    >
                                      <div>
                                        <Tooltip title={`${item.promptEn && item.promptEn.split('&').length > 1 ? item.promptEn.split('&')[item.promptEn.split('&').length - 1] : item.promptEn}`}>
                                          <Button
                                            onClick={() => setUsedPromot(item.promptEn.split('&').length > 1 ? item.promptEn.split('&')[item.promptEn.split('&').length - 1] : item.promptEn)}
                                            type="default"
                                            className="flex justify-center items-center btn_no_mr"
                                            size="small"
                                            icon={<i className="iconfont icon-huabi"></i>}
                                          >
                                            使用
                                          </Button>
                                        </Tooltip>
                                      </div>
                                      <div>
                                        <Button
                                          disabled={!item.imageUrl}
                                          onClick={() => downloadImage(item.imageUrl.replace('https://cdn.discordapp.com/', 'https://mjcdn.achuanai.com/'))}
                                          type="default"
                                          className="flex justify-center items-center btn_no_mr"
                                          size="small"
                                          icon={<i className="iconfont icon-xiazaitupian"></i>}
                                        >
                                          下载
                                        </Button>
                                      </div>
                                      <div>
                                        <Popconfirm title="" description="是否删除该任务？" onConfirm={() => delTask(item.id)} okText="确认" okButtonProps={{ className: 'bg-[#1890ff] ' }} cancelText="取消">
                                          <Button type="default" className="flex justify-center items-center btn_no_mr" size="small" icon={<i className="iconfont icon-shanchu1"></i>}>
                                            删除
                                          </Button>
                                        </Popconfirm>
                                      </div>
                                    </ConfigProvider>
                                  </div>
                                </div>
                                <div className="my-4 h-[280px]">
                                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md relative">
                                    {item.progress && item.progress !== '' && item.progress !== '100%' && (
                                      <div className="radial-progress absolute text-[#3875f7]" style={{ '--value': item.progress && item.progress.replace('%', '') } as any} role="progressbar">
                                        {/* {item.status} */}
                                        {item.progress}
                                      </div>
                                    )}
                                    {item.status === 'IN_PROGRESS' ||
                                      (item.status === 'SUCCESS' && (
                                        <a href={item.imageUrl.replace('https://cdn.discordapp.com/', 'https://mjcdn.achuanai.com/')} className="w-full h-full flex justify-center items-center cursor-pointer" target="_blank" rel="noopener noreferrer">
                                          <img className="cursor-pointer max-w-[100%] h-full" loading="lazy" src={item.imageUrl.replace('https://cdn.discordapp.com/', 'https://mjcdn.achuanai.com/')} alt="" />
                                        </a>
                                      ))}
                                    {item.status === 'FAILURE' && (
                                      <div className="flex h-full w-full rounded-md bg-[#fafafc] dark:bg-[#262629]">
                                        <div className="m-auto overflow-hidden text-center">
                                          <img src={errorIcon} alt="" className="inline-block text-[100px] h-[8rem] w-[8rem]" />
                                          <h2 className="text-base">任务失败</h2>
                                          <div className="mt-2 text-sm line-clamp-3 text-slate-600 dark:text-slate-400">{item.failReason?.replace('[Invalid parameter]', '')}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="-mx-4 -mb-4 h-full flex items-start bg-[#fafafc] px-4 py-2 dark:bg-[#262629]">
                                  <div className="flex-1">
                                    <div>
                                      {item.action === 'IMAGINE' || item.action === 'VARIATION' || item.action === 'REROLL' ? (
                                        <>
                                          <div className="mb-2 flex items-center justify-between">
                                            <span>放大：</span>
                                            <Tooltip
                                              title={
                                                <>
                                                  <p> 参数释义:放大某张图片 </p>
                                                  <p> 如 U1 放大第一张图片，以此类推 </p>
                                                </>
                                              }
                                            >
                                              <InfoCircleOutlined rotate={180} />
                                            </Tooltip>
                                            <div className="flex-1">
                                              <div className="flex items-center justify-around">
                                                {new Array(4).fill(0).map((i, index) => {
                                                  return (
                                                    <Button disabled={item.status === 'FAILURE'} type="default" size="small" key={index} onClick={() => changeImagine('U', item.id, index + 1)}>
                                                      U{index + 1}
                                                    </Button>
                                                  )
                                                })}
                                                <Tooltip title={'重新生成'}>
                                                  <Button onClick={() => changeImagine('R', item.id)} disabled={item.status === 'FAILURE'} type="default" size="small" icon={<i className="iconfont icon-zhongxinshengcheng"></i>}></Button>
                                                </Tooltip>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="mb-2 flex items-center justify-between">
                                            <span>变换：</span>
                                            <Tooltip
                                              title={
                                                <>
                                                  <p>参数释义:以某张图片为基准重新生成</p>
                                                  <p>如 V1 则变换第一张图片，以此类推 </p>
                                                </>
                                              }
                                            >
                                              <InfoCircleOutlined rotate={180} />
                                            </Tooltip>
                                            <div className="flex-1">
                                              <div className="flex items-center justify-around">
                                                {new Array(4).fill(0).map((i, index) => {
                                                  return (
                                                    <Button disabled={item.status === 'FAILURE'} type="default" size="small" key={index} onClick={() => changeImagine('V', item.id, index + 1)}>
                                                      V{index + 1}
                                                    </Button>
                                                  )
                                                })}
                                                <Button className="opacity-0" type="default" size="small" icon={<i className="iconfont icon-zhongxinshengcheng"></i>}></Button>
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="mb-2 flex items-center justify-between">
                                            <span>执行：</span>
                                            <div className="flex-1">选中放大</div>
                                          </div>
                                          <div className="mb-2 flex items-center justify-between">
                                            <span>描述：</span>
                                            <div className="flex-1">{item.description}</div>
                                          </div>
                                        </>
                                      )}
                                      <div className="flex items-center justify-between text-slate-500">
                                        <span>时间：{dateFormat(item.startTime, 'yyyy-MM-dd HH:mm:ss')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </main>
                </div>
              </div>
              {/* 分页 */}
              {taskList && (
                <footer className="sticky bottom-0 left-0 right-0 mt-4 bg-[#f6f7f9] py-4 dark:bg-[#111114] pl-4">
                  <Pagination onChange={changePagination} pageSizeOptions={['12', '24', '48', '96']} total={taskList.length} showTotal={(total, range) => `第${range[0]}-${range[1]}条 共 ${total} 条`} defaultPageSize={12} defaultCurrent={1} />
                </footer>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default DrawDesigns
