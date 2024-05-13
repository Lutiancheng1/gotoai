import { Input, Modal, Tooltip } from 'antd'
import { useRef, useEffect, FC, useState } from 'react'
import './index.css'
import TextArea from 'antd/es/input/TextArea'
import { useUnmount, useUpdateEffect } from 'ahooks'
import Loading from '@/components/loading'
interface MosaicCanvasProps {
  imageUrl: string
  isVisible: boolean
  onClose: () => void
  onSubmit: (imageData: string, prompt: string) => void
  loading: boolean
}
interface Point {
  x: number
  y: number
}
interface HistoryItem {
  type: 'rectangle' | 'lasso'
  startX: number
  startY: number
  endX: number
  endY: number
  imageData: string // 保存当前画布的图像数据
  image?: CanvasImageSource // 假设 image 是 CanvasImageSource 类型
}
const tools = ['rectangle', 'lasso']
const MosaicCanvas: FC<MosaicCanvasProps> = ({ imageUrl, isVisible, onClose, onSubmit, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTool, setCurrentTool] = useState<'rectangle' | 'lasso'>('rectangle')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [prompt, setPrompt] = useState('')

  // 创建黑白图案
  const createCheckerPattern = (ctx: CanvasRenderingContext2D) => {
    // 创建一个临时 canvas 来绘制图案
    const patternCanvas = document.createElement('canvas')
    const patternCtx = patternCanvas.getContext('2d')!
    patternCanvas.width = 10 // 图案的宽度
    patternCanvas.height = 10 // 图案的高度

    // 绘制黑白块
    patternCtx.fillStyle = 'rgba(0, 0, 0, 0.5)' // 黑色块，半透明
    patternCtx.fillRect(0, 0, 5, 5) // 左上角
    patternCtx.fillRect(5, 5, 5, 5) // 右下角
    patternCtx.fillStyle = 'rgba(255, 255, 255, 0.5)' // 白色块，半透明
    patternCtx.fillRect(5, 0, 5, 5) // 右上角
    patternCtx.fillRect(0, 5, 5, 5) // 左下角

    // 使用这个图案创建一个 CanvasPattern
    return ctx.createPattern(patternCanvas, 'repeat')
  }
  useEffect(() => {
    setIsLoading(true)
  }, [imageUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageUrl
    // 指定的高度
    const specifiedHeight = 600
    // 这些变量需要在 useEffect 的更高作用域内定义
    let newWidth = 0 // 初始化新宽度为 0

    image.onload = () => {
      // 根据图片的宽高比计算新的宽度
      const aspectRatio = image.width / image.height
      newWidth = specifiedHeight * aspectRatio

      // 设置 canvas 的宽度和高度
      canvas.width = newWidth
      canvas.height = specifiedHeight

      // 在 canvas 上绘制完整的图片
      ctx.drawImage(image, 0, 0, newWidth, specifiedHeight)

      redrawHistory(ctx, history)
      setIsLoading(false)
    }

    let isDrawing = false
    let startX = 0
    let startY = 0
    let points: { x: number; y: number }[] = [] // For lasso tool

    const startDrawing = (e: MouseEvent) => {
      isDrawing = true
      startX = e.offsetX
      startY = e.offsetY
      if (currentTool === 'lasso') {
        points = [{ x: startX, y: startY }]
      }
    }

    const draw = (e: MouseEvent) => {
      if (!isDrawing) return
      const endX = e.offsetX
      const endY = e.offsetY
      // 清除画布并重新绘制图像和历史记录中的所有选区
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, newWidth, specifiedHeight)
      redrawHistory(ctx, history) // 重新绘制历史记录
      ctx.strokeStyle = '#4096ff'
      const checkerPattern = createCheckerPattern(ctx)!
      ctx.fillStyle = checkerPattern

      // 绘制当前选区
      if (currentTool === 'rectangle') {
        // 绘制矩形轮廓
        ctx.strokeRect(startX, startY, endX - startX, endY - startY)
        // 填充矩形
        ctx.fillRect(startX, startY, endX - startX, endY - startY)
      } else if (currentTool === 'lasso') {
        points.push({ x: endX, y: endY })
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        points.forEach((point) => ctx.lineTo(point.x, point.y))
        ctx.closePath()
        // 绘制路径轮廓
        ctx.stroke()
        // 填充路径
        ctx.fill()
      }
    }

    const finishDrawing = (e: MouseEvent) => {
      if (!isDrawing) return
      isDrawing = false
      let endX = currentTool === 'lasso' && points.length ? points[points.length - 1].x : e.offsetX
      let endY = currentTool === 'lasso' && points.length ? points[points.length - 1].y : e.offsetY
      let imageData = ''
      if (currentTool === 'lasso') {
        // 对于 lasso 工具，将点的数组转换为字符串保存
        imageData = JSON.stringify(points)
      } else {
        // 对于 rectangle 工具，保存画布的图像数据
        imageData = canvasRef.current!.toDataURL()
      }

      setHistory((prevHistory) => [...prevHistory, { type: currentTool, startX, startY, endX, endY, imageData }])
      console.log(history, 'history')
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', finishDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', finishDrawing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTool, history, imageUrl])
  const redrawHistory = (ctx: CanvasRenderingContext2D, history: HistoryItem[], drawStroke = false) => {
    // 创建黑白块图案
    const checkerPattern = createCheckerPattern(ctx)!
    ctx.fillStyle = checkerPattern

    history.forEach((item) => {
      if (item.type === 'rectangle') {
        if (drawStroke) {
          // 设置描边颜色
          ctx.strokeStyle = '#4096ff'
          ctx.strokeRect(item.startX, item.startY, item.endX - item.startX, item.endY - item.startY)
        }
        // 填充矩形
        ctx.fillRect(item.startX, item.startY, item.endX - item.startX, item.endY - item.startY)
      } else if (item.type === 'lasso') {
        // 对于 lasso 工具，您需要创建一个路径来填充
        // 假设 points 是从 item.imageData 解析出的点数组
        const points = JSON.parse(item.imageData)
        if (points.length) {
          ctx.beginPath()
          ctx.moveTo(points[0].x, points[0].y)
          points.forEach((point: { x: number; y: number }) => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.closePath()
          // 填充路径
          ctx.fill()
          if (drawStroke) {
            ctx.strokeStyle = '#4096ff'
            // 描边路径
            ctx.stroke()
          }
        }
      }
    })
  }
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 创建临时Canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return
    const handleMouseMove = (e: MouseEvent) => {
      // 清除临时Canvas
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      let hoveredItemIndex = -1 // 用于记录当前悬停的历史记录项索引

      history.forEach((item, index) => {
        tempCtx.beginPath() // 在临时上下文中开始新路径
        if (item.type === 'rectangle') {
          tempCtx.rect(item.startX!, item.startY!, item.endX! - item.startX!, item.endY! - item.startY!)
        } else if (item.type === 'lasso' && item.imageData) {
          // 假设item.imageData是一个包含点位信息的JSON字符串
          const points = JSON.parse(item.imageData) as Point[] // 从item.imageData中解析点位信息
          if (points && points.length) {
            tempCtx.moveTo(points[0].x, points[0].y)
            points.forEach((point) => tempCtx.lineTo(point.x, point.y))
            tempCtx.closePath()
          }
        }
        if (tempCtx.isPointInPath(mouseX, mouseY)) {
          hoveredItemIndex = index
        }
      })
      history.forEach((item, index) => {
        // 使用tempCtx绘制动态内容（例如，描边）
        redrawHistoryItem(tempCtx, item, index === hoveredItemIndex)
      })
      // 将临时Canvas的内容绘制到主Canvas上
      ctx.drawImage(tempCanvas, 0, 0)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [history])
  const redrawHistoryItem = (ctx: CanvasRenderingContext2D, item: HistoryItem, drawStroke: boolean) => {
    ctx.save()
    ctx.beginPath()
    if (item.type === 'rectangle') {
      ctx.rect(item.startX, item.startY, item.endX - item.startX, item.endY - item.startY)
    } else if (item.type === 'lasso' && item.imageData) {
      const points = JSON.parse(item.imageData) as Point[]
      ctx.moveTo(points[0].x, points[0].y)
      points.forEach((point) => ctx.lineTo(point.x, point.y))
      ctx.closePath()
    }
    if (drawStroke) {
      ctx.strokeStyle = '#4096ff' // 设置描边颜色
      ctx.stroke() // 绘制描边
    }
    ctx.restore()
  }
  // 撤销
  const handleUndo = () => {
    if (history.length === 0) return
    const newHistory = history.slice(0, -1)
    setHistory(newHistory)
    const canvas = canvasRef.current!
    const ctx = canvas?.getContext('2d')
    if (ctx && newHistory.length > 0) {
      const lastImage = new Image()
      lastImage.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(lastImage, 0, 0) // 重绘上一次的画布状态
      }
      lastImage.src = newHistory[newHistory.length - 1].imageData // 加载最后一条历史记录的图像数据
    } else {
      // 如果没有历史记录了，清除画布
      // ctx!.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  const handleSubmit = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL()
      onSubmit(imageData, prompt)
    }
  }
  const onHandleClose = () => {
    // 关闭画布
    onClose()
    setHistory([])
    setCurrentTool('rectangle')
  }
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (loading) return
    if (e.keyCode === 13) {
      if (history.length === 0 || !prompt) return
      handleSubmit()
    }
  }
  return (
    <Modal className="mosaic_canvas" title="局部重绘" width={960} open={isVisible} onOk={handleSubmit} onCancel={onHandleClose} footer={null}>
      {isLoading && (
        <div id="mask" className="w-[600px] h-full opacity-50" style={{ position: 'absolute', top: 0, zIndex: 999, backgroundColor: '#fff' }}>
          <div className="absolute " style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <Loading></Loading>
          </div>
        </div>
      )}
      <div className="mb-10 h-[600px]">
        <canvas ref={canvasRef} />
      </div>
      <div id="appbody">
        <div className="hstack">
          {tools.map((tool) => {
            return (
              <Tooltip key={tool} title={tool === 'rectangle' ? '矩形' : '不规则形'} placement="top">
                <button className={`toolButton ${currentTool === tool ? 'selected' : ''}`} onClick={() => setCurrentTool(tool as 'rectangle' | 'lasso')}>
                  {tool === 'rectangle' ? (
                    <svg
                      className="svg-icon"
                      height="20px"
                      style={{
                        overflow: 'hidden',
                        verticalAlign: 'middle'
                      }}
                      version="1.1"
                      viewBox="0 0 1024 1024"
                      width="20px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M768 42.65984l85.34016 0q53.00224 0 90.50112 37.49888t37.49888 90.50112l0 85.34016q0 17.67424-12.4928 30.16704t-30.16704 12.4928-30.16704-12.4928-12.4928-30.16704l0-85.34016q0-17.67424-12.4928-30.16704t-30.16704-12.4928l-85.34016 0q-17.67424 0-30.16704-12.4928t-12.4928-30.16704 12.4928-30.16704 30.16704-12.4928zM85.34016 725.34016q17.67424 0 30.16704 12.4928t12.4928 30.16704l0 85.34016q0 17.67424 12.4928 30.16704t30.16704 12.4928l85.34016 0q17.67424 0 30.16704 12.4928t12.4928 30.16704-12.4928 30.16704-30.16704 12.4928l-85.34016 0q-53.00224 0-90.50112-37.49888t-37.49888-90.50112l0-85.34016q0-17.67424 12.4928-30.16704t30.16704-12.4928zM85.34016 384q17.67424 0 30.16704 12.4928t12.4928 30.16704l0 170.65984q0 17.67424-12.4928 30.16704t-30.16704 12.4928-30.16704-12.4928-12.4928-30.16704l0-170.65984q0-17.67424 12.4928-30.16704t30.16704-12.4928zM426.65984 896l170.65984 0q17.67424 0 30.16704 12.4928t12.4928 30.16704-12.4928 30.16704-30.16704 12.4928l-170.65984 0q-17.67424 0-30.16704-12.4928t-12.4928-30.16704 12.4928-30.16704 30.16704-12.4928zM170.65984 42.65984l85.34016 0q17.67424 0 30.16704 12.4928t12.4928 30.16704-12.4928 30.16704-30.16704 12.4928l-85.34016 0q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 85.34016q0 17.67424-12.4928 30.16704t-30.16704 12.4928-30.16704-12.4928-12.4928-30.16704l0-85.34016q0-53.00224 37.49888-90.50112t90.50112-37.49888zM938.65984 725.34016q17.67424 0 30.16704 12.4928t12.4928 30.16704l0 85.34016q0 53.00224-37.49888 90.50112t-90.50112 37.49888l-85.34016 0q-17.67424 0-30.16704-12.4928t-12.4928-30.16704 12.4928-30.16704 30.16704-12.4928l85.34016 0q17.67424 0 30.16704-12.4928t12.4928-30.16704l0-85.34016q0-17.67424 12.4928-30.16704t30.16704-12.4928zM938.65984 384q17.67424 0 30.16704 12.4928t12.4928 30.16704l0 170.65984q0 17.67424-12.4928 30.16704t-30.16704 12.4928-30.16704-12.4928-12.4928-30.16704l0-170.65984q0-17.67424 12.4928-30.16704t30.16704-12.4928zM426.65984 42.65984l170.65984 0q17.67424 0 30.16704 12.4928t12.4928 30.16704-12.4928 30.16704-30.16704 12.4928l-170.65984 0q-17.67424 0-30.16704-12.4928t-12.4928-30.16704 12.4928-30.16704 30.16704-12.4928z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg fill="none" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
                      <path
                        clipRule="evenodd"
                        d="M5.00001 10C5.00001 8.75523 5.7133 7.52938 7.06628 6.57433C8.41665 5.62113 10.3346 5 12.5 5C14.6654 5 16.5834 5.62113 17.9337 6.57433C19.2867 7.52938 20 8.75523 20 10C20 11.2448 19.2867 12.4706 17.9337 13.4257C16.5834 14.3789 14.6654 15 12.5 15C11.9849 15 11.4828 14.9648 10.9982 14.898C10.934 13.1045 9.18159 12 7.50001 12C6.92753 12 6.37589 12.1176 5.88506 12.3351C5.30127 11.6111 5.00001 10.8126 5.00001 10ZM12.5 17C11.7421 17 11.0036 16.9352 10.2949 16.8124C10.2111 16.9074 10.1215 16.9971 10.027 17.0814C10.0324 17.1351 10.0364 17.1937 10.0381 17.2566C10.0459 17.5458 10.0053 17.9424 9.80913 18.3641C9.38923 19.2667 8.42683 19.9562 6.7537 20.2187C4.68005 20.544 4.14608 21.1521 4.01748 21.3745C3.95033 21.4906 3.94254 21.5823 3.94406 21.6357C3.94468 21.6576 3.94702 21.6739 3.94861 21.6827C3.96296 21.7256 3.97448 21.7699 3.98295 21.8152C4.03316 22.0804 3.97228 22.3491 3.826 22.5638C3.74444 22.6836 3.63632 22.7865 3.50609 22.8627C3.40769 22.9205 3.29851 22.962 3.1823 22.9834C3.06521 23.0053 2.94748 23.0055 2.83406 22.9863C2.687 22.9617 2.55081 22.9051 2.43293 22.8238C2.31589 22.7434 2.21506 22.6375 2.13982 22.5103C2.1012 22.4453 2.06973 22.3756 2.0465 22.3023C2.04333 22.2927 2.04 22.2823 2.03655 22.2711C2.02484 22.2331 2.01167 22.1856 1.99902 22.1296C1.97383 22.0181 1.94991 21.8695 1.94487 21.6927C1.93466 21.3347 2.00276 20.8633 2.28609 20.3733C2.85846 19.3834 4.12384 18.6068 6.4437 18.2429C6.8529 18.1787 7.15489 18.0908 7.37778 17.9981C5.70287 17.9451 4.00001 16.8095 4.00001 15C4.00001 14.4998 4.14018 14.0417 4.37329 13.6452C3.52173 12.6101 3.00001 11.3665 3.00001 10C3.00001 7.93106 4.18951 6.15691 5.91292 4.94039C7.63895 3.72202 9.97098 3 12.5 3C15.029 3 17.3611 3.72202 19.0871 4.94039C20.8105 6.15691 22 7.93106 22 10C22 12.0689 20.8105 13.8431 19.0871 15.0596C17.3611 16.278 15.029 17 12.5 17ZM6.34227 14.3786C6.60474 14.1624 7.01132 14 7.50001 14C8.5482 14 9.00001 14.6444 9.00001 15C9.00001 15.0929 8.97952 15.185 8.9364 15.2772C8.85616 15.4487 8.687 15.6381 8.41217 15.7841C8.16534 15.9153 7.85219 16 7.50001 16C6.45182 16 6.00001 15.3556 6.00001 15C6.00001 14.8092 6.09212 14.5846 6.34227 14.3786Z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </Tooltip>
            )
          })}
          <Tooltip title="撤销" placement="top">
            <button className="toolButton Undo" title="Undo" onClick={handleUndo}>
              <svg height="20px" id="Capa_1" version="1.1" viewBox="0 0 20.298 20.298" width="20px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <path
                  d="M0.952,11.102c0-0.264,0.213-0.474,0.475-0.474h2.421c0.262,0,0.475,0.21,0.475,0.474 c0,3.211,2.615,5.826,5.827,5.826s5.827-2.615,5.827-5.826c0-3.214-2.614-5.826-5.827-5.826c-0.34,0-0.68,0.028-1.016,0.089 v1.647c0,0.193-0.116,0.367-0.291,0.439C8.662,7.524,8.46,7.482,8.322,7.347L3.49,4.074c-0.184-0.185-0.184-0.482,0-0.667 l4.833-3.268c0.136-0.136,0.338-0.176,0.519-0.104c0.175,0.074,0.291,0.246,0.291,0.438V1.96c0.34-0.038,0.68-0.057,1.016-0.057 c5.071,0,9.198,4.127,9.198,9.198c0,5.07-4.127,9.197-9.198,9.197C5.079,20.299,0.952,16.172,0.952,11.102z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
        <div className="bottomBarWrapper" id="bottomBar">
          <Input
            width={'300px'}
            placeholder="请输入重绘描述"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyUp={(e) => handleEnter(e)}
            addonAfter={
              <button
                className={`Submit ${loading ? 'loading loading-spinner loading-xs' : ''}`}
                title="Submit Job"
                onClick={handleSubmit}
                style={{
                  opacity: history.length === 0 || !prompt ? 0.5 : 1
                }}
                disabled={history.length === 0 || !prompt}
              >
                <svg fill="none" height="496" viewBox="0 0 502 496" width="502" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M176.518 454.8V361.136H29.9841C13.5252 361.136 0 347.598 0 331.102V164.89C0 148.437 13.4821 134.878 29.9841 134.878H176.496V41.1489C176.496 5.0694 219.423 -13.0675 245.438 10.8127L487.144 218.113C506.817 234.393 506.817 264.125 487.942 280.815L244.618 485.849C217.805 509.232 176.561 489.433 176.518 454.8Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            }
          />
        </div>
      </div>
    </Modal>
  )
}

export default MosaicCanvas
