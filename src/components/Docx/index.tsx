import React, { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import './index.css'
import Loading from '../loading'
import Toast from '../Toast'
import pageUpIcon from '../PDFViewer/images/pageup.svg'
import pageDownIcon from '../PDFViewer/images/pagedown.svg'
import minusIcon from '../PDFViewer/images/minus.svg'
import plusIcon from '../PDFViewer/images/plus.svg'
import { useMount, useUnmount } from 'ahooks'

interface WordPreviewProps {
  url: string // 仅支持 URL
  handleMouseUp?: (event: MouseEvent) => void
  hasTools?: boolean
}
let loadingBar = null as HTMLDivElement | null
let viewContainer = null as HTMLDivElement | null

const WordPreview: React.FC<WordPreviewProps> = ({ url, handleMouseUp, hasTools = true }) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(0.8) // 初始缩放比例为.8
  const [numPages, setNumPages] = useState<number>(1)
  // 当前页面
  const [pageNumber, setPageNumber] = useState(1)

  const zoomIn = () => {
    setScale((prevScale) => {
      return parseFloat((prevScale * 1.1).toFixed(1)) // 放大10%，保留1位小数
    })
  }

  const zoomOut = () => {
    setScale((prevScale) => {
      return parseFloat((prevScale / 1.1).toFixed(1)) // 缩小10%，保留1位小数
    })
  }
  const goToPreviousPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1))
    scrollToPage(pageNumber - 1)
  }
  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages))
    scrollToPage(pageNumber + 1)
  }

  const scrollToPage = (pageNum: number) => {
    requestAnimationFrame(() => {
      let pageContainer = document.querySelector(`.docx[data-page-number="${pageNum}"]`) as HTMLDivElement | null
      if (pageContainer && viewContainer) {
        const topPosition = pageContainer.getBoundingClientRect().top + window.pageYOffset - previewRef.current!.getBoundingClientRect().top
        viewContainer!.scrollTo({ top: topPosition, behavior: 'smooth' })
      }
    })
  }
  useEffect(() => {
    const loadDocument = () => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob' // 以 Blob 的形式接收数据
      setLoading(true)
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          loadingBar = document.getElementById('loadingBar') as HTMLDivElement
          if (loadingBar) {
            loadingBar.style.setProperty('--progressBar-percent', `${percentComplete}%`)
            if (loadingBar.classList.contains('hidden')) {
              loadingBar.classList.remove('hidden') // 显示进度条
            }
            if (percentComplete === 100) {
              loadingBar.classList.add('hidden') // 隐藏进度条
            }
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response
          setLoading(false)
          renderAsync(blob, previewRef.current!, undefined, {
            className: 'docx',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: false,
            experimental: false,
            trimXmlDeclaration: true,
            useBase64URL: true,
            renderChanges: false,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            debug: false
          })
            .then(() => {
              const pages = previewRef.current!.getElementsByClassName('docx')
              setNumPages(pages.length)
              for (let i = 0; i < pages.length; i++) {
                // 为每个页面元素添加一个唯一的 data-page-id 属性
                pages[i].setAttribute('data-page-number', `${i + 1}`)
              }
            })
            .catch(console.error)
        }
      }

      xhr.onerror = () => {
        setLoading(false)
        console.error('Error loading Word file')
        Toast.notify({ type: 'error', message: '文档加载失败' })
      }

      xhr.send()
    }

    loadDocument()
  }, [url])

  useMount(() => {
    handleMouseUp && previewRef.current?.addEventListener('mouseup', handleMouseUp)
    viewContainer = document.querySelector('.preview-container')! as HTMLDivElement
  })

  useUnmount(() => {
    handleMouseUp && previewRef.current?.removeEventListener('mouseup', handleMouseUp)
  })
  return (
    <>
      {loading && (
        <div id="mask" className="w-full h-full" style={{ position: 'absolute' }}>
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <Loading></Loading>
          </div>
        </div>
      )}
      <div className="word-preview-containe relative">
        <div
          ref={previewRef}
          style={{
            transform: `scale(${scale})`, // 使用 transform 属性应用缩放
            transformOrigin: 'top center', // 设置缩放中心点为容器中心
            width: '100%', // 确保容器宽度是100%，以便缩放时内容能够正确显示
            height: '100%' // 同样确保容器高度是100%
          }}
        ></div>
      </div>
      <div id="toolbarContainer">
        {hasTools && (
          <div id="toolbarViewer" style={{ pointerEvents: loading ? 'none' : 'auto' }}>
            <div id="toolbarViewerLeft">
              <div
                className="splitToolbarButton hiddenSmallView"
                style={{
                  alignItems: 'center',
                  display: 'flex'
                }}
              >
                <button className="toolbarButton" id="previous" disabled={pageNumber === 1} title="上一页" onClick={goToPreviousPage}>
                  <img src={pageUpIcon} alt="" />
                </button>
                <div
                  style={{
                    float: 'left',
                    marginLeft: '10px',
                    marginRight: '1px'
                  }}
                >
                  <span
                    id="pageNumberValue"
                    style={{
                      color: '#1a2029',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '7px 0px'
                    }}
                  >
                    {pageNumber}
                  </span>
                  <span
                    className="toolbarLabel"
                    id="numPages"
                    style={{
                      marginLeft: '6px',
                      paddingLeft: '0px'
                    }}
                  >
                    / {numPages}
                  </span>
                </div>
                <button className="toolbarButton" id="next" disabled={pageNumber === numPages} title="下一页" onClick={goToNextPage}>
                  <img src={pageDownIcon} alt="" />
                </button>
              </div>
            </div>
            <div id="toolbarViewerMiddle">
              <div
                className="splitToolbarButton"
                style={{
                  alignItems: 'center',
                  display: 'flex'
                }}
              >
                <button className="toolbarButton" id="zoomOut" title="缩小" disabled={scale === 0.5} onClick={zoomOut}>
                  <img src={minusIcon} alt="" />
                </button>
                <div
                  id="zoomValue"
                  style={{
                    color: '#1a2029',
                    float: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '0 10px'
                  }}
                >
                  {parseInt((scale * 100).toFixed(0)) + '%'}
                </div>
                <button className="toolbarButton" id="zoomIn" title="放大" onClick={zoomIn}>
                  <img src={plusIcon} alt="" />
                </button>
              </div>
            </div>
          </div>
        )}
        <div
          id="loadingBar"
          style={{
            bottom: !hasTools ? '0' : ''
          }}
        >
          <div className="progress">
            <div className="glimmer"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WordPreview
