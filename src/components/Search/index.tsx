import { Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import sendIcon from '@/assets/images/send.svg'
import Footer from '../Footer'
import './index.css'
import { FileInfo } from '../Dialogue'
import { formatFileSize, formatFileType } from '@/utils/format'
import ExcelIcon from '@/assets/images/xlsx.png'
import PdfIcon from '@/assets/images/pdf.png'
import WordIcon from '@/assets/images/docx.png'
import anyIcon from '@/assets/images/anyfile.png'
/**
 * Renders the search component.
 *
 * @param {Props} props - The component props.
 * @param {Array} props.fileList - The list of files.
 * @param {Function} props.setFileList - The function to set the file list.
 * @param {string} props.sendValue - The value to send.
 * @param {Function} props.setSendValue - The function to set the send value.
 * @param {Function} props.uploadHandle - The function to handle file upload.
 * @param {Function} props.sendMessage - The function to send a message.
 * @param {boolean} props.messageLoading - Indicates if a message is loading.
 * @param {Function} props.enterMessage - The function to handle enter key press.
 * @return {JSX.Element} The rendered search component.
 */

type Props = {
  fileList: FileInfo[]
  setFileList: (value: FileInfo[]) => void
  sendValue: string
  setSendValue: (value: string) => void
  uploadHandle: (e: React.ChangeEvent<HTMLInputElement> | undefined) => void
  sendMessage: () => void
  messageLoading: boolean
  enterMessage: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  uploadRef: React.RefObject<HTMLInputElement>
  placeholder?: string
  hasUploadBtn?: boolean
  sse?: boolean
  hasFooter?: boolean
  scrollToBottom?: () => void
  multiple?: boolean
}

export function getIconUrlByFileType(fileType: string): string {
  const iconMap: { [key: string]: string } = {
    'application/pdf': PdfIcon,
    'application/msword': WordIcon,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': WordIcon,
    'application/vnd.ms-excel': ExcelIcon,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ExcelIcon
    // 其他文件类型...
  }

  return iconMap[fileType] || anyIcon // 如果找不到对应类型，返回默认图标的路径
}

export default function Search({ fileList, setFileList, sendValue, setSendValue, uploadHandle, sendMessage, messageLoading, enterMessage, uploadRef, placeholder, hasUploadBtn, sse, hasFooter, scrollToBottom, multiple }: Props) {
  return (
    <div className="search-box animate__bounceInUp">
      <div className="search-container">
        <div className="search flex">
          <div className="search-input-box">
            {fileList && fileList.length > 0 && (
              <div className="file-list-box">
                {fileList.map((item) => {
                  return (
                    <div className="file-box" key={item.uuid}>
                      <div className="file">
                        <div className="icon icon-img" style={{ backgroundImage: `url(${getIconUrlByFileType(item.type)})` }}>
                          {item.error && (
                            <div className="answer-error-icon file-retry-cover">
                              <p className="file-retry-icon" />
                            </div>
                          )}
                        </div>
                        <div className="file-info">
                          <p className="name dot text-ellipsis" title={item.name}>
                            {item.name}
                          </p>
                          <div className="status">
                            {item.loading && (
                              <p className="flex text-xs">
                                <span className="loading loading-spinner loading-xs mr-2"></span>上传中
                              </p>
                            )}
                            {!item.error && !item.loading && (
                              <div className="success">
                                <p className="type">{formatFileType(item.type)}</p> <p className="size">{formatFileSize(item.size)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="close" onClick={() => setFileList(fileList.filter((i) => i.uuid !== item.uuid))}></p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="input-wrap">
              <div className="input-box-inner">
                <TextArea value={sendValue} onKeyUp={(e) => enterMessage(e)} onChange={(e) => setSendValue(e.target.value)} placeholder={placeholder} autoSize={{ minRows: 1, maxRows: 9 }} onFocus={scrollToBottom} />
              </div>
              <div className="search-interactive">
                <div className="upload-image-wrap">
                  {hasUploadBtn && (
                    // <Tooltip title={<span className="text-12">最多上传十个文件,每个文件不超过20M</span>}>
                    <Tooltip title={<span className="text-12">最多支持十个文件,格式 pdf/csv/excel ,不超过20M</span>}>
                      <input onChange={(e) => uploadHandle(e)} ref={uploadRef} type="file" style={{ display: 'none' }} multiple={multiple} />
                      <div
                        className="upload-image-btn"
                        onClick={() => {
                          uploadRef.current?.click()
                        }}
                      ></div>
                    </Tooltip>
                  )}
                </div>
                <div className="search-operation">
                  <div className={`enter ${!sse && messageLoading ? 'loading loading-spinner loading-xs' : ''}`} onClick={() => sendMessage()}>
                    <img src={sendIcon} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 底部copyright */}
        {hasFooter && <Footer />}
      </div>
    </div>
  )
}
