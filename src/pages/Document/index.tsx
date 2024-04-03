import History from '@/components/history'
import './index.css'
import pdfIcon from '@/assets/images/pdf-session.svg'
import type { UploadProps } from 'antd'
import { Input, message, Upload } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
const { Dragger } = Upload
const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
  onChange(info) {
    const { status } = info.file
    if (status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files)
  }
}
export default function Document() {
  return (
    <div className="document">
      <History title="文档对话" title_Icon={true} item_Icon={<img src={pdfIcon} alt="" />} />
      <div className="upload-container">
        <div className="upload-box">
          <div className="title-box">
            <p className="title">文档解读助手</p>
            <p className="sub-title"> 上传一篇文档，可以针对文档内容进行问题解答，迎接更智能、更直观的处理文档方式。 </p>
          </div>
          <div className="sections">
            <div className="section">
              <div className="left">
                <div className="left-top">
                  <p
                    className="icon"
                    style={{
                      backgroundImage: 'url("https://sfile.chatglm.cn/chatglm/web/document_question_1692873581597.svg")'
                    }}
                  />
                  <p className="text">文档提问</p>
                </div>
                <p className="left-middle">对文章提问，大模型利用文章内容回答</p>
                <p className="left-bottom" />
              </div>
              <div
                className="right"
                style={{
                  backgroundImage: 'url("https://sfile.chatglm.cn/activeimg/bdms/6582b1f5b02c2c00505ff729")'
                }}
              />
            </div>
            <div className="section">
              <div className="left">
                <div className="left-top">
                  <p
                    className="icon"
                    style={{
                      backgroundImage: 'url("https://sfile.chatglm.cn/chatglm/web/document_analyze_1692873581597.svg")'
                    }}
                  />
                  <p className="text">文档总结</p>
                </div>
                <p className="left-middle">提取文章核心观点，要求简明扼要</p>
                <p className="left-bottom" />
              </div>
              <div
                className="right"
                style={{
                  backgroundImage: 'url("https://sfile.chatglm.cn/activeimg/bdms/6582b207c49b9d0066b83c56")'
                }}
              />
            </div>
            <div className="section">
              <div className="left">
                <div className="left-top">
                  <p
                    className="icon"
                    style={{
                      backgroundImage: 'url("https://sfile.chatglm.cn/chatglm/web/document_translate_1692873581597.svg")'
                    }}
                  />
                  <p className="text">文档翻译</p>
                </div>
                <p className="left-middle">选择文章中的内容翻译为英文</p>
                <p className="left-bottom" />
              </div>
              <div
                className="right"
                style={{
                  backgroundImage: 'url("https://sfile.chatglm.cn/activeimg/bdms/6582b2174464eb0049b088ca")'
                }}
              />
            </div>
          </div>
          <div className="my_upload">
            <Dragger {...props}>
              <div className="upload-outer-box">
                <div className="upload-inner-box">
                  <div className="tip">
                    <div className="tip-left" />
                    <div className="tip-right">
                      <p className="tip-right-title">
                        <span className="blue">点击上传</span>
                        <span>，</span>
                        <span>或拖动文档到这里</span>
                      </p>
                      <p className="tip-right-subtitle">
                        <span>支持PDF文件，文件大小不超过30M，不支持扫描件</span> <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)', marginLeft: 10 }} />
                      </p>
                    </div>
                  </div>
                  <div slot="tip" className="operation">
                    <Input onClick={(e) => e.stopPropagation()} className="upload_input" autoComplete="off" placeholder="输入PDF文档链接" suffix={<i className="input-icon"></i>} />
                  </div>
                </div>
              </div>
            </Dragger>
          </div>

          <div className="upload-status-outer-box" style={{ display: 'none' }}>
            <div className="upload-status-inner-box">
              <p className="img" style={{ backgroundImage: 'url("")' }} />
              <p className="text" />
              <p className="operate-button"></p>
            </div>
          </div>
          <div className="analyze-box" style={{ display: 'none' }}>
            <div className="analyze-title">
              <div className="analyze-title-text">
                <p className="analyze-doc-icon" />
                <p className="analyze-doc-text">正在学习，请勿关闭当前网页...</p>
              </div>
              <video src={require('@/assets/video/analyze.mp4')} autoPlay loop muted className="analyze-icon" />
            </div>
            <div className="analyze-progress">
              <p className="analyze-progress-text" />
              <p className="analyze-progress-stop"> 停止 </p>
              <div className="analyze-progress-bar" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="upload-dialog-container split-pane" style={{ display: 'none' }}>
        {/* pdfjs预览 */}
        <div className="left" style={{ width: '50%' }}></div>
        {/* 对话框 */}
        <div className="right" style={{ width: '50%' }}></div>
      </div>
    </div>
  )
}
