import Toast from '@/components/Toast'
import { getTokenInfo } from '@/utils/storage'
import { Button, ConfigProvider, GetProp, Input, Popover, Select, Tooltip, UploadProps } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import Dragger from 'antd/es/upload/Dragger'
import './index.css'
import { useRef, useState } from 'react'
import { RcFile } from 'antd/es/upload'
import { REACT_APP_BASE_URL_CONFIG } from '@/config'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import PDFViewer from '@/components/PDFViewer'
import { isExcelFile, isExcelFileType, isHtmlFile, isHtmlFileType, isPdfFile, isPdfFileType, isTextFileType, isTxtFile, isWordFile, isWordFileType } from '@/utils/is'
import WordPreview from '@/components/Docx'
import ExcelPreview from '@/components/Excel'
import SplitPane, { Pane } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'
import TxtPreview from '@/components/TxtViewer'
import HtmlCodePreview from '@/components/HtmlViewer'

const downloadFile = async (filename: string, url: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('下载失败')
    }
    const blob = await response.blob()
    const path = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = path
    link.download = filename
    link.click()
    // 移除按钮
    link.remove()
    // 释放内存
    URL.revokeObjectURL(path)
    Toast.notify({ type: 'success', message: '下载成功，请查看浏览器下载页' })
  } catch (error) {
    Toast.notify({ type: 'error', message: '下载失败' })
    console.error(error)
  }
}
type BaiduInput = {
  from: string
  to: string
  input: {
    content: string | null
    format: string
    filename: string
    transImage: number
  }
}
type BaiduResponse = {
  code: number // 0 表示成功 10005 表示翻译失败
  msg: string
  data?: {
    requestId: string
  }
}

type ResponseData = {
  requestId: number
  status: 0 | 1 | 2 //状态：0 - 翻译中；1- 翻译成功；2 - 翻译失败
  reason: string
  fileSrcUrl: string
  outPutDocType: string
  from: string
  to: string
  name: string
  charCount: number
  amount: number
}

type TransResponse = {
  code: number // 错误码 0-成功 非0-失败
  msg: string
  data?: ResponseData // 请求结果数据集，当且仅当code为 0 时存在
}
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 10MB
const AppId = '20240506002043542'
const Key = 'Y38PvAPfOOyaBKOLnQsG'
const createTimestamp = () => {
  return Math.floor(Date.now() / 1000)
}
const createSign = (timestamp: number, input: BaiduInput | { requestId: string }) => {
  const str = `${AppId}${timestamp}${JSON.stringify(input)}`
  return CryptoJS.HmacSHA256(str, Key).toString(CryptoJS.enc.Base64)
}
const createHeader = (timestamp: number, sign: string) => {
  return {
    'Content-Type': 'application/json',
    'X-Appid': AppId,
    'X-Sign': sign,
    'X-Timestamp': timestamp
  }
}
const languageOptions = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英语' },
  { value: 'yue', label: '粤语' },
  { value: 'wyw', label: '文言文' },
  { value: 'cht', label: '繁体中文' },
  { value: 'jp', label: '日语' },
  { value: 'kor', label: '韩语' },
  { value: 'fra', label: '法语' },
  { value: 'spa', label: '西班牙语' },
  { value: 'th', label: '泰语' },
  { value: 'ara', label: '阿拉伯语' },
  { value: 'ru', label: '俄语' },
  { value: 'pt', label: '葡萄牙语' },
  { value: 'de', label: '德语' },
  { value: 'it', label: '意大利语' },
  { value: 'el', label: '希腊语' },
  { value: 'nl', label: '荷兰语' },
  { value: 'pl', label: '波兰语' },
  { value: 'bul', label: '保加利亚语' },
  { value: 'est', label: '爱沙尼亚语' },
  { value: 'dan', label: '丹麦语' },
  { value: 'fin', label: '芬兰语' },
  { value: 'cs', label: '捷克语' },
  { value: 'rom', label: '罗马尼亚语' },
  { value: 'slo', label: '斯洛文尼亚语' },
  { value: 'swe', label: '瑞典语' },
  { value: 'hu', label: '匈牙利语' },
  { value: 'vie', label: '越南语' }
]
const mimeTypeToShortType: { [key: string]: string } = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  // 'application/vnd.ms-powerpoint': 'ppt',
  // 'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx'
  'text/plain': 'txt',
  'text/html': 'html'
  // 'application/xml': 'xml'
}
function getMimeTypeFromShortType(shortType: string): string | undefined {
  for (const [mimeType, type] of Object.entries(mimeTypeToShortType)) {
    if (type === shortType) {
      return mimeType
    }
  }
  return undefined // 如果没有找到对应的 MIME 类型，则返回 undefined
}
function getShortType(mimeType: string): string {
  return mimeTypeToShortType[mimeType] || 'unknown'
}
const isValidFileType = (fileType: string): boolean => {
  return Object.keys(mimeTypeToShortType).includes(fileType)
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64String = result.split(',')[1] // 获取逗号之后的内容
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
  })

/**
 * 将 Base64 字符串转换为 ArrayBuffer。
 *
 * @param {string} base64String - 要转换的 Base64 字符串。
 * @return {ArrayBuffer} 转换后的 ArrayBuffer。
 */
const base64ToArrayBuffer = (base64String: string): ArrayBuffer => {
  const binaryString = atob(base64String)
  const len = binaryString.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}
const decodeBase64ToUrl = (base64String: string, fileType: string): string => {
  // 将 Base64 字符串解码为二进制数据
  const binaryString = atob(base64String)
  const len = binaryString.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // 创建一个 Blob 对象
  const blob = new Blob([bytes], { type: fileType })

  // 生成并返回一个可供直接访问的 URL 链接
  return URL.createObjectURL(blob)
}
export default function DocumentTranslation() {
  // from
  const [from, setFrom] = useState(languageOptions[0].value)
  // to
  const [to, setTo] = useState(languageOptions[1].value)
  // 上传成功的file 信息
  const [file, setFile] = useState<{
    fileName: string
    fileUrl: string | null
    fileBase64Url: string | null
    fileType: string
    status: 'success' | 'error'
  }>()
  // 翻译成功的结果文件
  const [translatedFile, setTranslatedFile] = useState({} as ResponseData)
  // 翻译中
  const [translating, setTranslating] = useState(false)
  // 区分是上传还是显示翻译结果页面
  const [isShowResult, setIsShowResult] = useState(false)
  const [sizes, setSizes] = useState([50, 50])

  // 当前提交翻译的文件ID
  const fileId = useRef(null)
  const props: UploadProps = {
    name: 'file',
    // accept: '.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt,.xml,.html,',
    accept: '.doc,.docx,.pdf,.xls,.xlsx,,.html,.txt',
    async beforeUpload(file) {
      if (!isValidFileType(file.type)) {
        Toast.notify({
          type: 'error',
          message: '只能上传指定格式的文件!'
        })
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2) // 将文件大小转换为MB，并保留两位小数
        Toast.notify({
          type: 'error',
          message: `文件大小超出限制: ${fileSizeInMB} MB. 最大允许: 10 MB.`
        })
        return false
      }
      return true
    },
    onDrop(e) {
      const file = e.dataTransfer.files[0]

      if (!isValidFileType(file.type)) {
        Toast.notify({
          type: 'error',
          message: '只能上传指定格式的文件!'
        })
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2) // 将文件大小转换为MB，并保留两位小数
        Toast.notify({
          type: 'error',
          message: `文件大小超出限制: ${fileSizeInMB} MB. 最大允许: 10 MB.`
        })
        return
      }
    },
    customRequest(options) {
      const { file } = options
      console.log(file)

      getBase64(file as FileType)
        .then((data) => {
          setFile({
            fileBase64Url: data,
            fileUrl: decodeBase64ToUrl(data, (file as RcFile).type),
            fileName: (file as RcFile).name,
            fileType: getShortType((file as RcFile).type),
            status: 'success'
          })
        })
        .catch((err) => {
          setFile({
            fileBase64Url: null,
            fileUrl: null,
            fileName: (file as RcFile).name,
            fileType: getShortType((file as RcFile).type),
            status: 'error'
          })
        })
    }
  }
  // 过滤掉已选择语言的选项
  const getFilteredOptions = (selectedValue: string) => {
    return languageOptions.filter((option) => option.value !== selectedValue)
  }

  const handleFromChange = (value: string) => {
    setFrom(value)
    // 更新目标语言选项，确保不包含已选择的源语言
    const filteredOptions = getFilteredOptions(value)
    if (filteredOptions.every((option) => option.value !== to)) {
      setTo(filteredOptions[0].value)
    }
  }
  const onSubmit = async () => {
    console.log(file, 'file')

    if (!file) return
    setTranslating(true)
    const url = `${REACT_APP_BASE_URL_CONFIG.REACT_APP_FANYI_BASE_URL}/transapi/doctrans/createjob/trans`
    const input = {
      from,
      to,
      input: {
        content: file.fileBase64Url,
        format: file.fileType,
        filename: file.fileName,
        transImage: 0
      }
    }
    const timestamp = createTimestamp()
    const sign = createSign(timestamp, input)
    const header = createHeader(timestamp, sign)
    try {
      const res = await axios.post(url, input, {
        headers: header
      })
      if ((res.data as BaiduResponse).code === 0) {
        const requestId = res.data.data.requestId
        fileId.current = requestId
        Toast.notify({
          message: '提交成功',
          type: 'success',
          duration: 1000
        })
        pollTranslateProgress()
      } else {
        Toast.notify({
          type: 'error',
          message: res.data.msg
        })
      }
    } catch (error) {
      console.error(error)
      setTranslating(false)
    }
  }
  // 查询翻译进度
  const getTranslateProgress = async (): Promise<TransResponse> => {
    const url = `${REACT_APP_BASE_URL_CONFIG.REACT_APP_FANYI_BASE_URL}/transapi/doctrans/query/trans`
    const input = {
      requestId: fileId.current!
    }
    const timestamp = createTimestamp()
    const sign = createSign(timestamp, input)
    const header = createHeader(timestamp, sign)
    const res = await axios.post(url, input, {
      headers: header
    })
    return res.data
  }

  const pollTranslateProgress = async () => {
    try {
      while (true) {
        const response = await getTranslateProgress()
        if (response.code !== 0) {
          Toast.notify({
            type: 'error',
            message: response.msg,
            duration: 1000
          })
          break
        }
        if (!response.data) break
        const { status } = response.data
        if (status === 0) {
          Toast.notify({
            type: 'info',
            message: '翻译中...',
            duration: 3000
          })
        } else if (status === 1) {
          setTranslatedFile(response.data)
          setTranslating(false)
          setIsShowResult(true)
          Toast.notify({
            type: 'success',
            message: '翻译成功',
            duration: 1000
          })
          break
        } else if (status === 2) {
          setTranslating(false)
          Toast.notify({
            type: 'error',
            message: '翻译失败:' + response.data.reason,
            duration: 1000
          })
          break
        }
        // Wait for 2 .5 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 2500))
      }
    } catch (error) {
      console.error('Polling error:', error)
      Toast.notify({
        type: 'error',
        message: '翻译失败',
        duration: 1000
      })
      setTranslating(false)
    }
  }
  return (
    <div className="document_translation size-full">
      <div
        className="w-full h-full px-8 pt-8"
        style={{
          display: isShowResult ? 'none' : ''
        }}
      >
        <div className="w-full h-1/3">
          <ConfigProvider
            theme={{
              components: {
                Upload: {
                  colorBorder: '#2454ff',
                  colorFillAlter: '#fff'
                }
              }
            }}
          >
            <Dragger {...props}>
              {!file && (
                <div>
                  <div className="GA40_Jm0">
                    <div className="CYRylvL4 lXf7MBWg">doc/docx</div>
                    <div className="CYRylvL4 YKE4Qwjv">pdf</div>
                    <div className="CYRylvL4 aVbzGVwt">xls/xlsx</div>
                    {/* <div className="CYRylvL4 _e3T4ue9">ppt/pptx</div> */}
                    <div className="CYRylvL4 wqQpLzOv">txt</div>
                    {/* <div className="CYRylvL4 oDYfxW8Z">xml</div> */}
                    <div className="CYRylvL4 Z9Wzu3Ub">html</div>
                  </div>
                  <div className="Y_B4cuHJ">点击或拖拽上传</div>
                  <p className="text-[#7F7F7F]">文件大小不超过20MB</p>
                </div>
              )}
              {file && file.fileBase64Url && file.status === 'success' && (
                <div className="w-full flex justify-center flex-col items-center">
                  <img src="https://fanyi-cdn.cdn.bcebos.com/static/cat/asset/success.17d80abd.png" alt="" width="64" />
                  <div
                    style={{
                      color: 'rgb(135, 195, 143)'
                    }}
                  >
                    文件上传成功
                  </div>
                  <div>{file.fileName}</div>
                  <div className="text-[#7F7F7F]">点击或拖拽重新上传</div>
                </div>
              )}
              {file && !file.fileBase64Url && file.status === 'error' && (
                <div className="w-full flex justify-center flex-col items-center">
                  <img src="https://fanyi-cdn.cdn.bcebos.com/static/cat/asset/fail.efc35e6d.png" alt="" width="64" />
                  <div className="text-[#7F7F7F]">文件上传失败,请重新拖拽或点击上传</div>
                </div>
              )}
            </Dragger>
          </ConfigProvider>
        </div>
        <div className="w-full h-[136px] bg-white mt-6 rounded-[10px]">
          <div className="flex items-center pl-[13px] h-[56px] border-b-[1px] border-[#EFEFEF]">
            <div className="w-1/4 required">语言方向</div>
          </div>
          <div className="w-full h-[80px] flex pl-[13px] items-center">
            <div className="w-1/4 flex items-center">
              <Select value={from} onChange={handleFromChange} style={{ width: 120 }} options={languageOptions} />
              <i className="iconfont icon-zuoyouqiehuan !text-[24p] px-1 cursor-pointer transform transition duration-500" />
              <Select className="no_outline" value={to} onChange={setTo} style={{ width: 120 }} options={getFilteredOptions(from)} />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center mt-6">
          <Button type="primary" loading={translating} onClick={onSubmit} disabled={!file || file.status !== 'success' || !file.fileBase64Url} className="bg-[#1677ff]">
            立即翻译
          </Button>
        </div>
      </div>
      <div
        className="w-full h-full"
        style={{
          display: isShowResult ? '' : 'none'
        }}
      >
        <div className="flex justify-between items-center w-full h-[48px] pl-[16px]">
          <div
            className="text-14 font-medium cursor-pointer"
            onClick={() => {
              setIsShowResult(false)
            }}
          >
            <span className=" ">
              <i className="iconfont icon-fanhui !text-18 font-600 w-2 h-[14px] mr-2 align-middle" />
              返回上传
            </span>
          </div>
          <div className="pr-4">
            {translatedFile && translatedFile.fileSrcUrl && (
              <Tooltip title="下载翻译结果文件" placement="left">
                <Button type="default" size="small" className="flex justify-center items-center btn_no_mr" onClick={() => downloadFile(`translated_${translatedFile.name}`, translatedFile.fileSrcUrl)} icon={<i className="iconfont icon-xiazai !text-[18px] cursor-pointer" />}>
                  下载
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="preview_con w-full h-full relative split-pane px-2">
          <SplitPane split="vertical" sizes={sizes} onChange={setSizes} sashRender={() => null}>
            <Pane minSize={'30%'}>
              <div className="nw-scrollbar w-full bg-[#eef1f9] left preview-container-from px-1" style={{ overflowY: 'scroll', height: 'calc(100vh - 94px)' }}>
                {/* 判断文件类型 */}
                {file && file.fileUrl && (
                  <>
                    {isPdfFile(file.fileName) && <PDFViewer url={file.fileUrl} hasTools={true} targetViewContainer={document.querySelector('.preview-container-from') as HTMLDivElement} />}
                    {isWordFile(file.fileName) && <WordPreview url={file.fileUrl} targetViewContainer={document.querySelector('.preview-container-from') as HTMLDivElement} />}
                    {isExcelFile(file.fileName) && <ExcelPreview url={file.fileUrl} />}
                    {/* {isPptFile(file.fileName) && <DocViewer documents={[{ uri: file.fileUrl, fileType: getMimeTypeFromShortType(file.fileType) }]} />} */}
                    {isTxtFile(file.fileName) && <TxtPreview url={file.fileUrl} />}
                    {isHtmlFile(file.fileName) && <HtmlCodePreview url={file.fileUrl} />}
                  </>
                )}
              </div>
            </Pane>
            <Pane minSize={'30%'}>
              <div className="nw-scrollbar w-full right bg-[#d4d4d7] px-1 preview-container-to" style={{ overflowY: 'scroll', height: 'calc(100vh - 94px)' }}>
                {/* 判断文件类型 */}
                {translatedFile && translatedFile.status === 1 && translatedFile.fileSrcUrl && (
                  <>
                    {isPdfFileType(translatedFile.outPutDocType) && <PDFViewer url={translatedFile.fileSrcUrl} hasTools={true} targetViewContainer={document.querySelector('.preview-container-to') as HTMLDivElement} />}
                    {isWordFileType(translatedFile.outPutDocType) && <WordPreview url={translatedFile.fileSrcUrl} targetViewContainer={document.querySelector('.preview-container-to') as HTMLDivElement} />}
                    {isExcelFileType(translatedFile.outPutDocType) && <ExcelPreview url={translatedFile.fileSrcUrl} />}
                    {isTextFileType(translatedFile.outPutDocType) && <TxtPreview url={translatedFile.fileSrcUrl} />}
                    {/* {isPptFile(translatedFile.outPutDocType) && <DocViewer documents={[{ uri: translatedFile.fileSrcUrl, fileType: getMimeTypeFromShortType(translatedFile.outPutDocType) }]} />} */}
                    {isHtmlFileType(translatedFile.outPutDocType) && <HtmlCodePreview url={translatedFile.fileSrcUrl} />}
                  </>
                )}
              </div>
            </Pane>
          </SplitPane>
        </div>
      </div>
    </div>
  )
}
