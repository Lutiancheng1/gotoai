import { Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useRef } from 'react'
import sendIcon from '@/assets/images/send.svg'
import Footer from '../Footer'
import './index.css'
type Props = {
  fileList: any[]
  setFileList: (value: any[]) => void
  sendValue: string
  setSendValue: (value: string) => void
  uploadHandle: (e: any) => void
  sendMessage: () => void
  messageLoading: boolean
  enterMessage: (e: any) => void
}

export default function Search({ fileList, setFileList, sendValue, setSendValue, uploadHandle, sendMessage, messageLoading, enterMessage }: Props) {
  const uploadRef = useRef<HTMLInputElement>(null)
  return (
    <div className="search-box animate__bounceInUp">
      <div className="search-container">
        <div className="search flex">
          <div className="search-input-box">
            {fileList && fileList.length > 0 && (
              <div className="file-list-box">
                {fileList.map((item) => {
                  return (
                    <div className="file-box" key={item.file_id}>
                      <div className="file">
                        <div className="icon icon-img" style={{ backgroundImage: `url("${item.file_url}")` }}></div>
                        <div className="file-info">
                          <p className="name dot">{item.file_name}</p>
                          <div className="status">
                            <div className="success">
                              <p className="type">{item.type}</p> <p className="size">{item.file_size}</p>
                            </div>
                          </div>
                        </div>
                        <p className="close" onClick={() => setFileList(fileList.filter((i) => i.file_id !== item.file_id))}></p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="input-wrap">
              <div className="input-box-inner">
                <TextArea wrap="off" value={sendValue} onKeyUp={(e) => enterMessage(e)} onChange={(e) => setSendValue(e.target.value)} placeholder="输入你的问题或需求" autoSize={{ minRows: 1, maxRows: 9 }} />
              </div>
              <div className="search-interactive">
                <div className="upload-image-wrap">
                  <Tooltip title={'最多上传10个文件,每个文件不超过20M'}>
                    <input onChange={(e) => uploadHandle(e)} ref={uploadRef} type="file" style={{ display: 'none' }} multiple />
                    <div
                      className="upload-image-btn"
                      onClick={() => {
                        uploadRef.current?.click()
                      }}
                    ></div>
                  </Tooltip>
                </div>
                <div className="search-operation">
                  <div className={`enter ${messageLoading ? 'loading loading-spinner loading-xs' : ''}`} onClick={() => sendMessage()}>
                    <img src={sendIcon} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 底部copyright */}
        <Footer />
      </div>
    </div>
  )
}
