import { useEffect, useRef, useState } from 'react'
import './index.css'
import { Button, ConfigProvider, Input, InputNumber, InputNumberProps, List, Select, Switch, Tabs, Tooltip, Upload, UploadProps, Popconfirm, Tag, Modal, Pagination, Slider, UploadFile, GetProp, FloatButton, Drawer } from 'antd'
import { InfoCircleOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import Toast from '@/components/Toast'
import TextArea from 'antd/es/input/TextArea'
import { useAsyncEffect, useBoolean, useMount, useRequest, useUnmount, useUpdateEffect } from 'ahooks'
import MJIcon from '@/assets/images/mj.jpg'
import NIJIIcon from '@/assets/images/niji.jpg'
import { ITab, pictureRatioWarp, modelVersions, qualityLevels, tabs, tabsWarp, modalWarp, stylizationWarp, stylesWarp, mosaicRatioWarp, mode } from './constant'
import { deleteTask, DimensionsType, getTaskList, getTaskQueue, submitBlend, submitDescribe, submitDrawAction, submitDrawImagine, submitModal, submitShorten, TaskListResponse } from '@/api/MJself'
import axios from 'axios'
import { MD5 } from '@/utils/md5'
import { dateFormat } from '@/utils/libs'
import { UploadRequestOption } from 'rc-upload/lib/interface'
import Loading from '@/components/loading'
import errorIcon from '@/assets/images/error.png'
import NotFoundImg from '@/assets/images/NotFound.png'
import { RcFile } from 'antd/es/upload'
import React from 'react'
import Gallery from './gallery'
import MosaicCanvas from './MosaicCanvas/MosaicCanvas'

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
export interface Mjbutton {
  customId: string
  emoji: string
  label: string
  type: number
  style: number
}

export interface TaskList {
  id: string
  taskId: string
  action: string
  prompt: string
  promptEn: string
  description: string
  state: string
  submitTime: number
  startTime: number
  finishTime: number
  imageUrl: string
  status: string
  progress: string
  failReason: string
  buttons: Mjbutton[]
}
const labelMappings = {
  'Upscale (2x)': '2倍采样',
  'Upscale (4x)': '4倍采样',
  'Redo Upscale (2x)': '重新2倍采样',
  'Redo Upscale (4x)': '重新4倍采样',
  'Upscale (Subtle)': '微调上采样',
  'Redo Upscale (Subtle)': '重新轻微上采样',
  'Upscale (Creative)': '创意上采样',
  'Redo Upscale (Creative)': '重新创意上采样',
  'Vary (Subtle)': '微调变化',
  'Vary (Strong)': '强烈变化',
  'Vary (Region)': '局部重绘',
  'Zoom Out 2x': '放大 2倍',
  'Zoom Out 1.5x': '放大 1.5倍',
  'Custom Zoom': '自定义缩放',
  'Make Square': '正方形化',
  '⬅️': '向左扩展',
  '➡️': '向右扩展',
  '⬆️': '向上扩展',
  '⬇️': '向下扩展',
  '❤️': '收藏',
  '': '' // 这里给没有label的按钮一个默认描述
} as { [key: string]: string }
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
// 调整字符串 --iw 和 --v
const adjustString = (str: string) => {
  const regex = /(--iw (\d+))(.*)?(--v (\d+\.\d+))/
  return str.replace(regex, '$4$3$1')
}
// 下载图片
export const downloadImage = async (url: string) => {
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
    link.download = `image_${new Date().getTime()}.jpg` // 替换为你想要的文件名
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
  // 融图的图片比例
  const [mosaicRatio, setMosaicRatio] = useState<DimensionsType>(mosaicRatioWarp[0].value as DimensionsType)
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
  const [taskList, setTaskList] = useState<TaskListResponse>({
    pageCount: 0,
    pageIndex: 0,
    recordCount: 0,
    rows: []
  })
  // 当前正在进行任务队列
  const [TaskQueueList, setTaskQueueList] = useState<TaskListResponse>({
    pageCount: 0,
    pageIndex: 0,
    recordCount: 0,
    rows: []
  })
  // 创建按钮loading
  const [submitLoading, setSubmitLoading] = useState(false)
  // prompt中 是否有参数
  const [withParamsPrompt, setWithParamsPrompt] = useState(false)
  const regexp = /--(?:version|v|aspect|ar|quality|q|chaos|c|stylize|s|raw|fast|iw|no|style|relax|repeat|seed|stop|turbo|video|weird|iw)/
  // loading
  const [isLoading, setIsLoading] = useState(true)
  // 分页
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  // 以图生图modal显示隐藏
  const [isShowTsT, setIsShowTsT] = useState(false)
  // 以图生文字modal显示隐藏
  const [isShowTsW, setIsShowTsW] = useState(false)
  // 以图生文loading
  const [tsWLoading, setTsWLoading] = useState(false)
  // 融图loading
  const [rtLoading, setRtLoading] = useState(false)
  // 自定义缩放loading
  const [customizeLoading, setCustomizeLoading] = useState(false)
  // 融图modal显示隐藏
  const [isShowRt, setIsShowRt] = useState(false)
  // 图生图 权重
  const [weights, setWeights] = useState(1)
  // 图生图base64图片数组
  const [tstBase64List, setTstBase64List] = useState<UploadFile[]>([])
  // 以图生文base64图片数组
  const [tsWBase64List, setTsWBase64List] = useState<UploadFile[]>([])
  // 融图base64图片数组
  const [rtBase64List, setRtBase64List] = useState<UploadFile[]>([])
  // 预览visible
  const [previewVisible, setPreviewVisible] = useState(false)
  // 预览图片
  const [previewImage, setPreviewImage] = useState('')
  // prompt翻译loading
  const [promptTranslateLoading, setPromptTranslateLoading] = useState(false)
  // 忽略元素翻译loading
  const [ignoreTranslateLoading, setIgnoreTranslateLoading] = useState(false)
  // 自定义缩放modal 显示隐藏
  const [isShowZoom, setIsShowZoom] = useState(false)
  // 自定义缩放input
  const [zoomInputValue, setZoomInputValue] = useState('')
  // 当前自定义缩放项的data
  const [currentZoomData, setCurrentZoomData] = useState<{
    b: Mjbutton
    task: TaskList
  }>()
  // 局部重绘canvas显示隐藏
  const [isShowCanvas, setIsShowCanvas] = useState(false)
  // 当前局部重绘data
  const [canvasData, setCanvasData] = useState<{
    imageUrl: string
    b: Mjbutton
    task: TaskList
  }>()
  // 局部重绘提交loading
  const [canvasLoading, setCanvasLoading] = useState(false)
  // 提词优化loading
  const [promptOptimizeLoading, setPromptOptimizeLoading] = useState(false)
  // 提词助手显示隐藏
  const [isShowPromptHelper, setIsShowPromptHelper] = useState(false)
  const [modal, contextHolder] = Modal.useModal()

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
  const menuClick = (key: ITab, prompt?: string) => {
    // console.log(key, prompt, 'key')
    setCurrentTab(key)
    setIsFold(false)
    if (prompt) {
      setPrompt(prompt)
    }
  }
  const promptChange = (value: string) => {
    setPrompt(value.replace('/imagine prompt: ', ''))
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
    //
    useUpdateEffect(() => {
      setTimeout(() => {
        getTaskLists()
      }, 3000)
    }, [TaskQueueList.recordCount])

    const pollingTaskQueueInterval = useRef<NodeJS.Timeout | null>(null)

    const { runAsync: getTaskQueueList } = useRequest(getTaskQueue, {
      manual: true
    })

    // 立即执行一次轮询逻辑，然后设置定时器
    const pollImmediatelyAndStartInterval = async (pollFunction: () => Promise<void>, interval: number, setIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>): Promise<void> => {
      await pollFunction() // 立即执行一次轮询
      setIntervalRef.current = setInterval(pollFunction, interval) // 设置定时器继续轮询
    }

    // 开始轮询任务队列
    const startPollingTaskQueue = () => {
      if (pollingTaskQueueInterval.current === null) {
        const pollFunction = async () => {
          const data = await getTaskQueueList()
          if (data) {
            setTaskQueueList(data)
            // 更新 taskList 中的任务状态
            setTaskList((prevTaskList) => {
              const updatedRows = prevTaskList.rows.map((task) => {
                const foundTask = data.rows.find((queueTask) => queueTask.taskId === task.taskId)
                return foundTask ? foundTask : task
              })
              return { ...prevTaskList, rows: updatedRows }
            })
            if (data.rows.length === 0 || data.rows.filter((task) => task.status !== 'FAILURE').every((task) => task.progress === '100%')) {
              stopPollingTaskQueue() // 队列为空时停止轮询任务队列
            }
          } else {
            stopPollingTaskQueue()
          }
        }
        pollImmediatelyAndStartInterval(pollFunction, 9000, pollingTaskQueueInterval) // 轮询
      }
    }
    // 停止轮询任务队列
    const stopPollingTaskQueue = () => {
      if (pollingTaskQueueInterval.current) {
        clearInterval(pollingTaskQueueInterval.current)
        pollingTaskQueueInterval.current = null
      }
    }

    useUnmount(() => {
      // 组件卸载时清理轮询
      stopPollingTaskQueue()
    })

    return {
      startPollingTaskQueue,
      stopPollingTaskQueue
    }
  }

  // 使用usePolling
  const { startPollingTaskQueue, stopPollingTaskQueue } = usePolling()
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
      resultPrompt += `--version ${currentVersion} --aspect ${pictureRatio} --stylize ${stylization} --quality ${quality} --chaos ${confusion} ${raw ? '--style raw' : ''} ${ignoreElements ? `--no ${ignoreElements}` : ''} ${repeate ? '--tile' : ''} ${
        tstBase64List.length > 0 ? '--iw ' + weights : ''
      }`
    } else {
      resultPrompt += `--niji ${currentVersion} --aspect ${pictureRatio} --stylize ${stylization} --quality ${quality} --chaos ${confusion} ${currentStyle ? `--style ${currentStyle}` : ''} ${ignoreElements ? `--no ${ignoreElements}` : ''} ${tstBase64List.length > 0 ? '--iw ' + weights : ''}`
    }
    if (!withParams) {
      resultPrompt = prompt
    }

    try {
      const res = await submitDrawImagine({
        prompt: resultPrompt,
        base64Array: tstBase64List.length > 0 ? (tstBase64List.map((item) => item.url) as [string]) : [],
        notifyHook: '',
        state: '',
        mode
      })
      setPrompt('')
      setIgnoreElements('')
      setSubmitLoading(false)
      setTstBase64List([])
      setTrueWithParams()
      if (res.code === 0) {
        await getTaskLists()
      }
    } catch (error) {
      console.log(error)
      Toast.notify({ type: 'error', message: '创建任务失败' })
      setSubmitLoading(false)
    }
  }
  //  删除任务
  const delTask = async (taskId: string) => {
    const res = await deleteTask(taskId)
    if (res.code === 200) {
      Toast.notify({ type: 'success', message: '删除成功' })
      setTaskList({ ...taskList, rows: taskList.rows.filter((task) => task.taskId !== taskId) })
    }
  }

  // Save JSON
  const downloadJson = async () => {
    try {
      const formattedTaskList = taskList.rows
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
    getTaskLists(true, page, pageSize)
  }
  const getTaskLists = async (needLoading?: boolean, page?: number, size?: number) => {
    needLoading && setIsLoading(true)
    const data = await getTaskList({
      page: page ? page : currentPage,
      pageSize: size ? size : pageSize
    })
    needLoading && setIsLoading(false)
    console.log(data, 'getTaskLists')
    if (!data) return

    // 如果任务队列中有正在进行的任务，使用任务队列中的任务值
    if (TaskQueueList.rows.length > 0 && TaskQueueList.rows.some((task) => task.status !== 'FAILURE' && task.progress !== '100%')) {
      const updatedRows = data.rows.map((task) => {
        const foundTask = TaskQueueList.rows.find((queueTask) => queueTask.id === task.id)
        return foundTask ? foundTask : task
      })
      setTaskList({ ...data, rows: updatedRows })
    } else {
      setTaskList(data)
    }

    if (data.rows.some((task) => task.status !== 'FAILURE' && task.progress !== '100%')) {
      // 有任务进行中 开始监听
      startPollingTaskQueue()
    }
  }
  const getTaskQueueList = async () => {
    const data = await getTaskQueue()
    if (!data) return
    if (data.pageCount === 0) return
    setTaskQueueList(data)
    startPollingTaskQueue()

    // 更新 taskList 中的任务状态
    setTaskList((prevTaskList) => {
      const updatedRows = prevTaskList.rows.map((task) => {
        const foundTask = data.rows.find((queueTask) => queueTask.id === task.taskId)
        return foundTask ? foundTask : task
      })
      return { ...prevTaskList, rows: updatedRows }
    })
  }
  const translate = async (target: string) => {
    const AppId = '20240506002043542'
    const Key = 'Y38PvAPfOOyaBKOLnQsG'
    const salt = Date.now()
    const sign = MD5(`${AppId}${target === 'prompt' ? prompt : ignoreElements}${salt}${Key}`)
    const url = `https://fanyi.gotoai.world/api/trans/vip/translate?q=${encodeURIComponent(target === 'prompt' ? prompt : ignoreElements)}&from=auto&to=en&appid=${AppId}&salt=${salt}&sign=${sign}`

    try {
      if (target === 'prompt') {
        setPromptTranslateLoading(true)
        const res = await axios.get(url)
        if (res && res.data) {
          setPrompt(res.data.trans_result[0].dst)
          setPromptTranslateLoading(false)
        } else {
          setPromptTranslateLoading(false)
        }
      } else {
        setIgnoreTranslateLoading(true)
        const res = await axios.get(url)
        if (res && res.data) {
          setIgnoreElements(res.data.trans_result[0].dst)
          setIgnoreTranslateLoading(false)
        } else {
          setIgnoreTranslateLoading(false)
        }
      }
    } catch (error) {
      setPromptTranslateLoading(false)
      setIgnoreTranslateLoading(false)
      Toast.notify({ type: 'error', message: '翻译失败' })
    }
  }
  // 变换图片
  const changeImagine = async (action: 'U' | 'V' | 'R', taskId: string, customId: string, index?: number) => {
    modal.confirm({
      title: '提示',
      content: index ? `是否${action === 'U' ? '放大' : '变换'}第${index}张图片?` : '是否重新生成该组图片?',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'primary',
      maskClosable: true,
      async onOk() {
        const data = await submitDrawAction({
          mode,
          customId,
          taskId
        })
        if (data.code === 0) {
          getTaskLists()
        }
      }
    })

    console.log(action, taskId, index)
  }
  // 提交action 任务 该接口是用于点击图片下方的按钮
  const submitAction = async (b: Mjbutton, task: TaskList, msg: string) => {
    console.log(b, task, msg)
    let content
    content = `是否${msg}该图片?`
    modal.confirm({
      title: '提示',
      content,
      centered: true,
      okText: '确认',
      cancelText: '取消',
      okType: 'primary',
      maskClosable: true,
      async onOk() {
        if (msg === '收藏') return
        const data = await submitDrawAction({
          mode,
          customId: b.customId,
          taskId: task.taskId
        })

        if (data.code === 0) {
          getTaskLists()
        }
      }
    })
  }
  // 初始化获取任务队列列表
  useMount(async () => {
    await getTaskLists(true)
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
      setTstBase64List([
        ...(tstBase64List as []),
        {
          url: res,
          name: f.name,
          status: 'done',
          uid: f.uid
        }
      ])
    }
  }
  const customRequestTsW = async ({ file }: UploadRequestOption) => {
    const f = file as RcFile
    const res = (await getBase64(f)) as string
    if (res) {
      setTsWBase64List([
        {
          url: res,
          name: f.name,
          status: 'done',
          uid: f.uid
        }
      ])
    }
  }
  const customRequestRt = async ({ file }: UploadRequestOption) => {
    const f = file as RcFile
    const res = (await getBase64(f)) as string
    if (res) {
      setRtBase64List((pre) => {
        return [
          ...pre,
          {
            url: res,
            name: f.name,
            status: 'done',
            uid: f.uid
          }
        ]
      })
    }
  }
  // 以图生图删除
  const onTstRemove = (file: UploadFile) => {
    setTstBase64List(tstBase64List.filter((item) => item.uid !== file.uid))
  }
  // 以图生文删除
  const onTswRemove = (file: UploadFile) => {
    setTsWBase64List(tsWBase64List.filter((item) => item.uid !== file.uid))
  }
  // 融图删除
  const onRtRemove = (file: UploadFile) => {
    setRtBase64List(rtBase64List.filter((item) => item.uid !== file.uid))
  }
  // 图生文ok
  const onTswOk = async () => {
    if (tsWBase64List.length === 0) return Toast.notify({ type: 'warning', message: '请上传图片' })
    setTsWLoading(true)
    const res = await submitDescribe({
      mode,
      base64: tsWBase64List.map((item) => item.url).join()
    })
    setTsWLoading(false)
    setTsWBase64List([])
    setIsShowTsW(false)
    if (res.code === 0) {
      getTaskLists()
    }
  }
  // 融图ok
  const onRtOk = async () => {
    if (rtBase64List.length === 0) return Toast.notify({ type: 'warning', message: '请上传图片' })
    setRtLoading(true)
    const res = await submitBlend({
      mode: 'FAST',
      base64Array: rtBase64List.map((item) => item.url) as string[],
      dimensions: mosaicRatio
    })
    setRtLoading(false)
    setRtBase64List([])
    setIsShowRt(false)
    if (res.code === 0) {
      getTaskLists()
    }
  }
  // canvas open
  const openCanvas = (b: Mjbutton, task: TaskList) => {
    setCanvasData({
      imageUrl: task.imageUrl,
      b,
      task
    })
    setIsShowCanvas(true)
  }
  // 局部重绘ok
  const onSubmit = async (imageData: string, prompt: string) => {
    if (!canvasData) return
    setCanvasLoading(true)
    const { b, task } = canvasData
    try {
      const data = await submitDrawAction({
        mode,
        customId: b.customId,
        taskId: task.taskId
      })
      if (data.code === 200) {
        const res = await submitModal({
          maskBase64: imageData,
          prompt,
          taskId: data.data
        })
        if (res.code === 0) {
          setCanvasLoading(false)
          setIsShowCanvas(false)
          getTaskLists()
        }
      }
    } catch (error) {
      setCanvasLoading(false)
      setIsShowCanvas(false)
      Toast.notify({ type: 'error', message: '重绘失败' })
    }
  }
  // 自定义缩放
  const onScaleChange = (b: Mjbutton, task: TaskList) => {
    setCurrentZoomData({
      b,
      task
    })
    setIsShowZoom(true)
    setZoomInputValue(`${task.imageUrl}  ${adjustString(task.promptEn)}  --zoom 2`)
  }
  const customZoomOk = async () => {
    if (customizeLoading) return
    if (!currentZoomData) return
    setCustomizeLoading(true)
    const { b, task } = currentZoomData
    try {
      const data = await submitDrawAction({
        mode,
        customId: b.customId,
        taskId: task.taskId
      })
      if (data.code === 200) {
        const res = await submitModal({
          prompt: zoomInputValue,
          taskId: data.data,
          maskBase64: ''
        })
        if (res.code === 0) {
          setCustomizeLoading(false)
          setIsShowZoom(false)
          getTaskLists()
        }
      }
    } catch (error) {
      setCustomizeLoading(false)
      setIsShowZoom(false)
      Toast.notify({ type: 'error', message: '自定义缩放失败' })
    }
  }
  // prompt优化
  const promptOptimize = async () => {
    if (!prompt) return
    if (promptOptimizeLoading) return
    setPromptOptimizeLoading(true)
    try {
      const data = await submitShorten({
        mode,
        prompt
      })
      if (data.code === 0) {
        setPromptOptimizeLoading(false)
        setPrompt('')
        getTaskLists()
      }
    } catch (error) {
      setPromptOptimizeLoading(false)
      Toast.notify({ type: 'error', message: '优化失败' })
    }
  }
  return (
    <div className="drawDesigns">
      {contextHolder}
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
                              <button disabled={item === 'imageProcessing'} className={`${item === currentTab ? 'active' : ''}`}>
                                {tabsWarp[item]}
                              </button>
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
            <Upload accept="image/*" beforeUpload={beforeUpload} customRequest={customRequest} listType="picture-card" fileList={tstBase64List} onPreview={handlePreview} onRemove={onTstRemove}>
              {tstBase64List && tstBase64List.length >= 2 ? null : <UploadOutlined />}
            </Upload>
            <Modal destroyOnClose title="查看图片" open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
              <img alt="" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </div>
      </Modal>
      {/* 以图生文 */}
      <Modal
        title="以图生文"
        open={isShowTsW}
        onOk={onTswOk}
        width={650}
        onCancel={() => {
          setIsShowTsW(false)
          setTsWBase64List([])
        }}
        confirmLoading={tsWLoading}
        okText="确认"
        cancelText="取消"
      >
        <div className="text-sm p-3">
          <p>上传一张图片生成相似的提示词</p>
        </div>
        <div className="p-2 flex">
          <div>上传图片：</div>
          <div>
            <Upload accept="image/*" beforeUpload={beforeUpload} customRequest={customRequestTsW} listType="picture-card" fileList={tsWBase64List} onPreview={handlePreview} onRemove={onTswRemove}>
              {tsWBase64List && tsWBase64List.length >= 1 ? null : <UploadOutlined />}
            </Upload>
            <Modal destroyOnClose title="查看图片" open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
              <img alt="" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </div>
      </Modal>
      {/* 融图 */}
      <Modal
        title="融图"
        open={isShowRt}
        onOk={onRtOk}
        width={700}
        onCancel={() => {
          setIsShowRt(false)
          setRtBase64List([])
        }}
        confirmLoading={rtLoading}
        okText="确认"
        cancelText="取消"
      >
        <div className="text-sm p-3">
          <p>1、融合图片风格，最多上传 5 张图片</p>
          <p>2、图片顺序越前，权重越高，建议把你最想融合的图片放在最前面</p>
        </div>
        <div className="p-2 flex">
          <div>图片比例：</div>
          <div className="aspect flex items-center space-x-4">
            {mosaicRatioWarp.map((item, index) => {
              return (
                <button
                  className={`aspect-item w-12 rounded border-2`}
                  style={{
                    border: mosaicRatio === item.value ? '2px solid #4096ff' : '',
                    color: mosaicRatio === item.value ? '#ccc !important' : ''
                  }}
                  key={index}
                  onClick={() => setMosaicRatio(item.value as DimensionsType)}
                >
                  <div className="aspect-box-wrapper mx-auto my-2 flex h-5 w-5 items-center justify-center">
                    <div className="aspect-box rounded border-2" style={{ width: item.w + '%', height: item.h + '%' }} />
                  </div>
                  <p className="mb-1 text-center text-sm">{item.label}</p>
                </button>
              )
            })}
          </div>
        </div>
        <div className="p-2 flex">
          <div>上传图片：</div>
          <div>
            <Upload accept="image/*" multiple beforeUpload={beforeUpload} customRequest={customRequestRt} listType="picture-card" fileList={rtBase64List} onPreview={handlePreview} onRemove={onRtRemove}>
              {rtBase64List && rtBase64List.length >= 5 ? null : <UploadOutlined />}
            </Upload>
            <Modal destroyOnClose title="查看图片" open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
              <img alt="" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </div>
      </Modal>
      {/* 自定义缩放 */}
      <Modal
        title="自定义缩放"
        open={isShowZoom}
        onOk={customZoomOk}
        width={700}
        onCancel={() => {
          setIsShowZoom(false)
          setZoomInputValue('')
        }}
        confirmLoading={customizeLoading}
        okText="确认"
        cancelText="取消"
      >
        <div className="text-sm p-3">
          <span className="font-500 text-xl">-- zoom </span>自定义缩放的值在 1.0 到 2.0之间
        </div>
        <div className="text-sm p-3">
          <TextArea value={zoomInputValue} onChange={(e) => setZoomInputValue(e.target.value)} autoSize={{ minRows: 1, maxRows: 6 }} />
        </div>
      </Modal>
      {/* 提词助手 */}
      <Drawer
        title="提示词生成助手"
        extra={
          <Button
            onClick={() => {
              const target = document.getElementById('tools_iframe')! as HTMLIFrameElement
              target.src = ''
              target.src = 'https://resource.gotoai.world/upload/system/tools/tools.html'
            }}
          >
            刷新
          </Button>
        }
        width={1200}
        onClose={() => setIsShowPromptHelper(false)}
        open={isShowPromptHelper}
      >
        <iframe id="tools_iframe" src="https://resource.gotoai.world/upload/system/tools/tools.html" style={{ width: '100%', height: '845px', overflow: 'hidden', overflowY: 'hidden' }} title="tools"></iframe>
      </Drawer>
      {/* 局部重绘 */}
      {canvasData && <MosaicCanvas loading={canvasLoading} isVisible={isShowCanvas} onClose={() => setIsShowCanvas(false)} imageUrl={canvasData.imageUrl} onSubmit={onSubmit}></MosaicCanvas>}
      {/* container */}
      <section className="draw-container w-full h-full flex overflow-hidden overflow-y-auto">
        {currentTab === 'imageCreation' && (
          <>
            <div className="relative bg-white" style={{ borderRight: '1px solid rgb(229, 231, 235)' }}>
              <div className="draw-controller w-[210px] p-3 animate__animated animate__fadeInLeft animate__faster" ref={controllerRef}>
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
                        <button className={`aspect-item flex-1 rounded border-2 ${pictureRatio === item.label ? 'active' : ''}`} key={index} onClick={() => setPictureRatio(item.label)}>
                          <div className="aspect-box-wrapper mx-auto my-2 flex h-5 w-5 items-center justify-center">
                            <div className="aspect-box rounded border-2" style={{ width: item.w + '%', height: item.h + '%' }} />
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
                          <button className="relative overflow-hidden rounded-md border-4">
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
                          <p>参数释义：用于生成可用作重复平铺、拼贴的图像，例如织物、壁纸和其他无缝纹理图案。</p>
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
                    <Select disabled={currentVersion === 6} value={currentVersion === 6 ? currentStyle : stylesWarp[1].value} style={{ width: 120 }} onChange={(value) => setCurrentStyle(value)} options={currentVersion === 5 ? stylesWarp.slice(1) : stylesWarp} allowClear={false} />
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
            <div className="draw-content w-full p-4 overflow-y-auto nw-scrollbar">
              {/* 头部 */}
              <header className="mb-3">
                <div className="title text-lg">AI绘画</div>
                <div className="subtitle mb-2">基于Midjourney的AI绘画工具</div>
                <p className="mb-2">图生图：生成类似风格或类型图像; 图生文：上传一张图片生成对应的提示词；融图：融合图片风格</p>
                <div className="btns">
                  <Button icon={<UploadOutlined />} type="primary" className="bg-blue-500 mr-2" onClick={() => setIsShowTsT(true)}>
                    以图生图（可选）
                  </Button>
                  <Button type="primary" className="bg-blue-500 mr-2" icon={<UploadOutlined />} onClick={() => setIsShowTsW(true)}>
                    以图生文（可选）
                  </Button>
                  <Button type="primary" className="bg-blue-500" icon={<UploadOutlined />} onClick={() => setIsShowRt(true)}>
                    融图（可选）
                  </Button>
                </div>
                {/* 预览 */}
                {!isShowTsT && tstBase64List && tstBase64List.length > 0 && (
                  //  圆角 边框
                  <div className="mt-4 p-4 bg-[#f6f7f9]" style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}>
                    <div className="mb-4">
                      <Button type="primary" danger onClick={() => setTstBase64List([])}>
                        清空参考图
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tstBase64List.map((item) => {
                        return (
                          <div className="flex flex-col items-center gap-2" key={item.url}>
                            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border ">
                              <img src={item.url} alt="" />
                            </div>
                            <Button danger icon={<i className="iconfont icon-shanchu1"></i>} onClick={() => setTstBase64List(tstBase64List.filter((i) => i.url !== item.url))} shape="circle"></Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </header>
              {/* 内容 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div>
                  <span className="mr-1">生成提示词</span>
                  <Tooltip
                    title={
                      <>
                        <p>Multi Prompts 多重提示 编写提示词时可添加 ::（两个半角冒号）作为分割符号，让 Midjourney Bot 将原本的完整的描述词视作两个或者多个单独的概念，我们还可以通过在 :: 后加上数字，为不同的概念分配的不通过的权重，使生成的图像在内容上对应产生变化。 </p>
                        <p>① 如果 :: 后没有添加数字，则默认权重值为 1。 </p>
                        <p>② v1/ v2/ v3 版本的 :: 权重只接受整数，v4 /v5 版本接受有小数点的权重，比如 ::1.2 或 ::-.5</p>
                        <p>③ 不同概念的权重与具体数值无关，与数值之间的比例有关，也就是以下三种数值最后的效果是一样的，因为最终 hot 的权重都是 dog 的 2 倍。 hot::2 dog 等于 hot::4 dog::2 等于 hot::100 dog::50</p>
                        <p>④ 带数字的分隔符会影响位于它前面的所有内容，直到新的分隔符切断这种影响。</p>
                        <p>⑤ 权重为 ::-.5 时，效果与 --no 负提示一样，以下的 2 种表述方式得到效果都是“生机勃勃郁金香花田，没有红色”。</p>
                      </>
                    }
                  >
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                  {withParamsPrompt ? '(提示词带有自定义参数，将不使用默认设定参数)' : ''} <span className="text-gray-500 text-[10px]">可将图片URL地址放在提词最前面以当作垫图</span>
                </div>
                <div>
                  {/* <Tooltip
                    title={
                      <>
                        <p>将提示词提交给 Midjourney Bot</p>
                        <p>对该提示词分析权重以及优化</p>
                      </>
                    }
                  >
                    <Button disabled={!prompt} className="mr-2 bg-blue-500" type="primary" onClick={promptOptimize}>
                      优化提词
                    </Button>
                  </Tooltip> */}
                  <Button icon={<i className="iconfont icon-tools"></i>} className="mr-2" onClick={() => setIsShowPromptHelper(true)}>
                    提词助手
                  </Button>
                  <Button disabled={!prompt} loading={promptTranslateLoading} type="primary" icon={<i className="iconfont icon-chajiantubiao_zhongyingfanyi"></i>} className="bg-blue-500" onClick={() => translate('prompt')}>
                    翻译
                  </Button>
                </div>
              </div>
              <div className="textarea_con mb-2">
                <TextArea value={prompt} onChange={(e) => promptChange(e.target.value)} allowClear placeholder="例如：a cute cat（建议使用英文进行描述,中文描述可能不准确）" autoSize={{ minRows: 3, maxRows: 5 }} />
              </div>
              {/* 忽略元素 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div>忽略元素（可选）</div>
                <div>
                  <Button disabled={!ignoreElements} loading={ignoreTranslateLoading} type="primary" icon={<i className="iconfont icon-chajiantubiao_zhongyingfanyi"></i>} className="bg-blue-500" onClick={() => translate('ignore')}>
                    翻译
                  </Button>
                </div>
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
                  dataSource={TaskQueueList.rows ? TaskQueueList.rows : []}
                  renderItem={(item, index) => {
                    if (index === 0)
                      return (
                        <div className="flex h-36" key={item.id}>
                          <div className="m-auto text-center">
                            <span className="loading loading-spinner loading-md"></span>
                            <div>
                              <p>当前 {TaskQueueList.recordCount} 个进行中的任务，请耐心等待。</p>
                            </div>
                          </div>
                        </div>
                      )
                  }}
                />
              </div>
              {/* 任务列表 */}
              {/* 开始按钮 */}
              <div className="start mb-3"></div>
              {/* 任务列表 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">任务列表</div>
                <span className="text-gray-400 text-xs">如遇到进度长时间未更新，请手动点击刷新按钮</span>
              </div>
              <div className="w-full flex justify-between items-center mb-2">
                <div>总记 : {taskList && taskList.recordCount}</div>
                <div>
                  <Button className="mr-2" type="default" icon={<i className="iconfont icon-shuaxin"></i>} onClick={() => getTaskLists(true)}>
                    刷新
                  </Button>
                  <Popconfirm title="保存绘画记录" description="保存当前页面绘画记录为本地 JSON ？" onConfirm={downloadJson} okText="确认" okButtonProps={{ className: 'bg-[#1890ff] ' }} cancelText="取消">
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
                      {taskList.rows &&
                        taskList.rows.length > 0 &&
                        taskList.rows.map((item) => {
                          return (
                            <div
                              style={{
                                gridColumn: `span ${columnSpan} / span ${columnSpan}`
                              }}
                              key={item.id}
                            >
                              <div className="h-full relative overflow-hidden rounded-md border p-4 transition-all hover:shadow">
                                <div className="flex items-center justify-between">
                                  <div className="task_tag">
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
                                      {item.status === 'NOT_START' ? '未启动' : item.status === 'SUBMITTED' ? '已提交处理' : item.status === 'IN_PROGRESS' ? '执行中' : item.status === 'FAILURE' ? '失败' : item.status === 'MODAL' ? '需弹窗确认' : '成功'}
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
                                      {item.action !== 'DESCRIBE' && item.promptEn && (
                                        <div>
                                          <Tooltip title={item.promptEn && item.promptEn}>
                                            <Button disabled={!item.promptEn} onClick={() => setUsedPromot(item.promptEn && item.promptEn)} type="default" className="flex justify-center items-center btn_no_mr" size="small" icon={<i className="iconfont icon-huabi"></i>}>
                                              使用
                                            </Button>
                                          </Tooltip>
                                        </div>
                                      )}
                                      <div>
                                        <Button disabled={!item.imageUrl} onClick={() => downloadImage(item.imageUrl)} type="default" className="flex justify-center items-center btn_no_mr" size="small" icon={<i className="iconfont icon-xiazaitupian"></i>}>
                                          下载
                                        </Button>
                                      </div>
                                      <div>
                                        <Popconfirm title="" description="是否删除该任务？" onConfirm={() => delTask(item.taskId)} okText="确认" okButtonProps={{ className: 'bg-[#1890ff] ' }} cancelText="取消">
                                          <Button type="default" className="flex justify-center items-center btn_no_mr" size="small" icon={<i className="iconfont icon-shanchu1"></i>}>
                                            删除
                                          </Button>
                                        </Popconfirm>
                                      </div>
                                    </ConfigProvider>
                                  </div>
                                </div>
                                <div className="my-4 h-[280px]">
                                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md relative" title={item.description}>
                                    {item.progress && item.progress !== '' && item.progress !== '100%' && (
                                      <div className="radial-progress absolute text-[#3875f7]" style={{ '--value': item.progress && item.progress.replace('%', '') } as any} role="progressbar">
                                        {/* {item.status} */}
                                        {item.progress}
                                      </div>
                                    )}
                                    {item.status === 'IN_PROGRESS' ||
                                      (item.status === 'SUCCESS' && (
                                        <a href={item.imageUrl} className="w-full h-full flex justify-center items-center cursor-pointer" target="_blank" rel="noopener noreferrer">
                                          <img
                                            className="cursor-pointer max-w-[100%] h-full"
                                            onError={(e) => {
                                              // e.currentTarget.src = NotFoundImg // 设置默认图片
                                              e.currentTarget.title = '图片无法加载' // 设置图片的 title 属性
                                            }}
                                            loading="lazy"
                                            src={item.imageUrl}
                                            alt=""
                                          />
                                        </a>
                                      ))}
                                    {item.status === 'FAILURE' && (
                                      <div className="flex h-full w-full rounded-md bg-[#fafafc] ">
                                        <div className="m-auto overflow-hidden text-center">
                                          <img src={errorIcon} alt="" className="inline-block text-[100px] h-[8rem] w-[8rem]" />
                                          <h2 className="text-base">任务失败</h2>
                                          <div className="mt-2 text-sm line-clamp-3 text-slate-600 ">{item.failReason?.replace('[Invalid parameter]', '')}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="-mx-4 -mb-4 h-full flex items-start bg-[#fafafc] px-4 py-2 ">
                                  <div className="flex-1">
                                    <div>
                                      {item.buttons && item.buttons.length > 0 && (
                                        <>
                                          {['IMAGINE', 'VARIATION', 'REROLL', 'ZOOM', 'BLEND'].includes(item.action) && (
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
                                                    {item.buttons
                                                      .filter((i) => i.label.startsWith('U'))
                                                      .map((i, index) => {
                                                        return (
                                                          <Button disabled={item.status === 'FAILURE'} type="default" size="small" key={i.customId} onClick={() => changeImagine('U', item.taskId, i.customId, index + 1)}>
                                                            {i.label}
                                                          </Button>
                                                        )
                                                      })}
                                                    {item.buttons
                                                      .filter((i) => i.label === '')
                                                      .map((i) => (
                                                        <Tooltip title={'重新生成'} key={i.customId}>
                                                          <Button onClick={() => changeImagine('R', item.taskId, i.customId)} disabled={item.status === 'FAILURE'} type="default" size="small" icon={<i className="iconfont icon-zhongxinshengcheng"></i>}></Button>
                                                        </Tooltip>
                                                      ))}
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
                                                    {item.buttons
                                                      .filter((i) => i.label.startsWith('V'))
                                                      .map((i, index) => {
                                                        return (
                                                          <Button disabled={item.status === 'FAILURE'} type="default" size="small" key={i.customId} onClick={() => changeImagine('V', item.taskId, i.customId, index + 1)}>
                                                            {i.label}
                                                          </Button>
                                                        )
                                                      })}
                                                    <Button className="opacity-0" type="default" size="small" icon={<i className="iconfont icon-zhongxinshengcheng"></i>}></Button>
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          {['PAN'].includes(item.action) && (
                                            <>
                                              <div className="mb-2 flex items-center justify-between min-h-[56px]">
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
                                                    {item.buttons
                                                      .filter((i) => i.label.startsWith('U'))
                                                      .map((i, index) => {
                                                        return (
                                                          <Button disabled={item.status === 'FAILURE'} type="default" size="small" key={i.customId} onClick={() => changeImagine('U', item.taskId, i.customId, index + 1)}>
                                                            {i.label}
                                                          </Button>
                                                        )
                                                      })}
                                                    {item.buttons
                                                      .filter((i) => i.label === '')
                                                      .map((i) => (
                                                        <Tooltip title={'重新生成'} key={i.customId}>
                                                          <Button onClick={() => changeImagine('R', item.taskId, i.customId)} disabled={item.status === 'FAILURE'} type="default" size="small" icon={<i className="iconfont icon-zhongxinshengcheng"></i>}></Button>
                                                        </Tooltip>
                                                      ))}
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          {['UPSCALE'].includes(item.action) && (
                                            <div
                                              className="mb-2 grid grid-cols-7 gap-4 min-h-[56px]"
                                              style={{
                                                alignItems: item.buttons.length > 7 ? 'flex-start' : 'center'
                                              }}
                                            >
                                              {item.buttons.map((b, i) => (
                                                <Tooltip key={b.customId} title={b.label ? labelMappings[b.label] : labelMappings[b.emoji]}>
                                                  <Button
                                                    onClick={b.label === 'Vary (Region)' ? () => openCanvas(b, item) : b.label === 'Custom Zoom' ? () => onScaleChange(b, item) : () => submitAction(b, item, b.label ? labelMappings[b.label] : labelMappings[b.emoji])}
                                                    disabled={item.status === 'FAILURE'}
                                                    type="default"
                                                    size="small"
                                                    icon={b.emoji === 'upscale_1' || b.emoji === '⏫' ? <i className="iconfont icon-julong" /> : b.emoji === '🖌️' ? <i className="iconfont icon-huabi1" /> : b.emoji}
                                                  ></Button>
                                                </Tooltip>
                                              ))}
                                            </div>
                                          )}
                                          {['DESCRIBE'].includes(item.action) && (
                                            <>
                                              <div className="mb-2 flex items-center justify-between">
                                                <span>类型：</span>
                                                <div className="flex-1">图生文</div>
                                              </div>
                                              <div className="mb-2 flex items-center justify-between">
                                                <span>提示词：</span>
                                                <Tooltip
                                                  title={
                                                    <>
                                                      <p> 参数释义:点击可以使用提示词 </p>
                                                      <p> 如 P1 则为第一个提示词，以此类推</p>
                                                    </>
                                                  }
                                                >
                                                  <InfoCircleOutlined rotate={180} />
                                                </Tooltip>
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-around">
                                                    {item.promptEn &&
                                                      item.promptEn
                                                        .replaceAll(/\d️⃣/g, '') // 使用正则表达式匹配并替换所有的数字序号
                                                        .split('\n\n')
                                                        .map((b, i) => (
                                                          <Tooltip key={i} title={b}>
                                                            <Button
                                                              onClick={() => {
                                                                setPrompt(b)
                                                                Toast.notify({
                                                                  type: 'success',
                                                                  message: '已使用，请查看提词框'
                                                                })
                                                              }}
                                                              disabled={item.status === 'FAILURE'}
                                                              type="default"
                                                              size="small"
                                                            >
                                                              P{i + 1}
                                                            </Button>
                                                          </Tooltip>
                                                        ))}
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          {/* {['SHORTEN'].includes(item.action) && (
                                            <>
                                              <div className="mb-2 flex items-center justify-between">
                                                <span>类型：</span>
                                                <div className="flex-1">提词优化</div>
                                              </div>
                                              <div className="mb-2 flex items-center justify-between">
                                                <span>提示词：</span>
                                                <Tooltip title={''}>
                                                  <InfoCircleOutlined rotate={180} />
                                                </Tooltip>
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-around">
                                                    {item.buttons.map((b, i) => (
                                                      <Tooltip title={''} key={b.customId}>
                                                        <Button onClick={() => submitAction(b, item, b.label)} disabled={item.status === 'FAILURE'} type="default" size="small" icon={b.emoji}></Button>
                                                      </Tooltip>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          )} */}
                                        </>
                                      )}
                                      {item.startTime && (
                                        <div
                                          className="flex items-center justify-between text-slate-500"
                                          style={{
                                            marginTop: item.buttons && item.buttons.length === 0 ? 64 : 0
                                          }}
                                        >
                                          <span>时间：{dateFormat(item.startTime, 'yyyy-MM-dd HH:mm:ss')}</span>
                                        </div>
                                      )}
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
                <footer className="sticky bottom-0 left-0 right-0 mt-4 bg-[#f6f7f9] py-4 pl-4">
                  <Pagination onChange={changePagination} pageSize={pageSize} current={currentPage} pageSizeOptions={['12', '24', '48', '96']} total={taskList.recordCount} showTotal={(total, range) => `第${range[0]}-${range[1]}条 共 ${total} 条`} />
                </footer>
              )}
            </div>
            <FloatButton.BackTop
              style={{
                right: 30
              }}
              target={() => document.querySelector('.draw-content') as HTMLElement}
            />
          </>
        )}
        {currentTab === 'gallery' && <Gallery itemClick={menuClick} />}
      </section>
    </div>
  )
}

export default DrawDesigns
