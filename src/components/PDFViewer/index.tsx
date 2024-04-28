import React, { useEffect, useState, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer.mjs'
import Loading from '../loading'
import { useDebounceFn, useMount, useScroll, useUnmount, useUpdateEffect } from 'ahooks'
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api'
import minusIcon from './images/minus.svg'
import plusIcon from './images/plus.svg'
import pageUpIcon from './images/pageup.svg'
import pageDownIcon from './images/pagedown.svg'
import 'pdfjs-dist/web/pdf_viewer.css'
import './index.css'
import Toast from '../Toast'
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.min.mjs'
interface PDFViewerProps {
  url: string
  handleMouseUp: (event: MouseEvent) => void
}
const eventBus = new pdfjsViewer.EventBus()
const linkService = new pdfjsViewer.PDFLinkService({
  eventBus: eventBus
})
let pdf = null as pdfjsLib.PDFDocumentProxy | null
let viewContainer = null as HTMLDivElement | null
let pdfPageView = null as pdfjsViewer.PDFPageView | null
let loadingTask = null as pdfjsLib.PDFDocumentLoadingTask | null
let loadingBar = null as HTMLDivElement | null
const PDFViewer: React.FC<PDFViewerProps> = ({ url, handleMouseUp }) => {
  const [numPages, setNumPages] = useState<number>(1)
  // 当前页面
  const [pageNumber, setPageNumber] = useState(1)
  const containerRef = useRef<HTMLDivElement | null>(null) // 添加一个ref来引用容器
  // loading
  const [loading, setLoading] = useState<boolean>(true)
  const [scale, setScale] = useState(1) // 初始缩放比例为1
  const [pdfPageViews, setPdfPageViews] = useState<pdfjsViewer.PDFPageView[]>([]) // 存储PDFPageView实例的数组
  // 使用useScroll监听滚动
  const scroll = useScroll(viewContainer)!
  const { run: updatePageNumber } = useDebounceFn(
    (pageNum) => {
      setPageNumber(pageNum)
    },
    { wait: 100 } // 100毫秒内的多次调用将被合并为一次
  )
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
  //  调整文本层尺寸的函数
  const adjustTextLayerSize = (pageNum: number, width: number | string, height: number | string) => {
    const canvasWrapper = document.querySelector(`.page[data-page-number="${pageNum}"] .canvasWrapper`) as HTMLDivElement | null
    const canvas = document.querySelector(`.page[data-page-number="${pageNum}"] canvas`) as HTMLCanvasElement | null

    if (canvasWrapper) {
      canvasWrapper.style.width = '100%'
      canvasWrapper.style.height = '100%'
    }
    if (canvas) {
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }
  }
  // 渲染页面的函数
  const renderPage = async (page: PDFPageProxy, pageNum: number) => {
    const viewport = page.getViewport({ scale })
    pdfPageView = new pdfjsViewer.PDFPageView({
      container: containerRef.current!,
      id: pageNum,
      scale,
      defaultViewport: viewport.clone(),
      eventBus: eventBus
    })
    pdfPageView.pageLabel = `第${pageNum}页`
    await pdfPageView.setPdfPage(page)
    linkService.setDocument(page)
    await pdfPageView.draw()
    const canvas = pdfPageView.canvas!

    console.log(canvas, 'canvas----------------')

    // 调整文本层尺寸以匹配canvas层
    adjustTextLayerSize(pageNum, canvas.style.width, canvas.style.height)

    setPdfPageViews((prev) => [...prev, pdfPageView] as pdfjsViewer.PDFPageView[]) // 将新的PDFPageView实例添加到数组中
    if (pageNum === 1) {
      setLoading(false) // 第一页渲染完成后取消加载状态
    }
  }
  useEffect(() => {
    if (!url) return
    const fetchPDF = async () => {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '' // 清理上一次的PDF内容
          pdfPageView?.destroy()
          setLoading(true)
          setPdfPageViews([]) // 清空PDFPageView实例数组
          setPageNumber(1)
          setNumPages(1)
          setScale(1)
          loadingTask && loadingTask.destroy()
          loadingBar && loadingBar.style.setProperty('--progressBar-percent', `0%`)
        }
        loadingTask = pdfjsLib.getDocument({
          url,
          rangeChunkSize: 65536 * 80, // 可以根据需要调整
          disableFontFace: true
        })

        // 进度条
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          const progressPercent = (loaded / total) * 100
          loadingBar = document.getElementById('loadingBar') as HTMLDivElement
          if (loadingBar) {
            loadingBar.style.setProperty('--progressBar-percent', `${progressPercent}%`)
            if (loadingBar.classList.contains('hidden')) {
              loadingBar.classList.remove('hidden') // 显示进度条
            }
            if (progressPercent === 100) {
              loadingBar.classList.add('hidden') // 隐藏进度条
            }
          }
        }
        pdf = await loadingTask.promise
        setNumPages(pdf.numPages) // 设置总页数

        // 首先加载并渲染第一页
        const firstPage = await pdf.getPage(1)
        await renderPage(firstPage, 1)

        // 在后台加载并渲染剩余页面
        for (let pageNum = 2; pageNum <= pdf.numPages; pageNum++) {
          pdf.getPage(pageNum).then((page) => renderPage(page, pageNum))
        }
      } catch (error) {
        console.error('Error loading PDF: ', error)
        setLoading(false)
        setPdfPageViews([])
        Toast.notify({ type: 'error', message: '加载PDF失败' })
      }
    }

    fetchPDF()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]) // 依赖项只有URL
  // 上一页和下一页的函数
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
      let pageContainer = document.querySelector(`.page[data-page-number="${pageNum}"]`) as HTMLDivElement | null
      if (pageContainer) {
        const topPosition = pageContainer.getBoundingClientRect().top + window.pageYOffset - containerRef.current!.getBoundingClientRect().top
        viewContainer!.scrollTo({ top: topPosition, behavior: 'smooth' })
      }
    })
  }

  const handleScroll = () => {
    const containerTop = scroll && scroll.top
    const containerCenter = viewContainer!.offsetHeight / 2 + containerTop!

    let closestPageNum = 1
    let minDistance = Infinity
    pdfPageViews.forEach((view, index) => {
      const pageTop = view.div.offsetTop
      const pageBottom = pageTop + view.div.clientHeight
      const pageCenter = pageTop + view.div.clientHeight / 2
      const distance = Math.abs(containerCenter - pageCenter)

      // 考虑页面的上下边界与容器中心的距离
      if (pageTop <= containerCenter && pageBottom >= containerCenter && distance < minDistance) {
        closestPageNum = index + 1
        minDistance = distance
      }
    })
    console.log(closestPageNum, minDistance, 'minDistance')

    updatePageNumber(closestPageNum)
  }
  useMount(() => {
    containerRef.current?.addEventListener('mouseup', handleMouseUp)
    viewContainer = document.querySelector('.preview-container')! as HTMLDivElement
  })

  useUnmount(() => {
    containerRef.current?.removeEventListener('mouseup', handleMouseUp)
    pdfPageViews.forEach((view) => view.destroy()) // 调用每个PDFPageView实例的destroy方法来销毁页面
  })
  useUpdateEffect(() => {
    if (pdf) {
      pdfPageViews.forEach((view) => {
        view.update({ scale })
        view.draw()
      })
    }
  }, [scale])
  return (
    <div>
      {loading && (
        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <Loading></Loading>
        </div>
      )}
      <div ref={containerRef} id="viewer" className="pdfViewer w-full h-full flex flex-col relative"></div>
      <div id="toolbarContainer">
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
        <div id="loadingBar">
          <div className="progress">
            <div className="glimmer"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFViewer
