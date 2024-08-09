import { InputNumber, Modal, Select } from 'antd'
import React, { CSSProperties, useState } from 'react'
import './index.css'
import CustomStyleForm from './CustomStyleForm'
type IStyleSettingProps = {
  open: boolean
  onClose: () => void
  onSubmit: (styles: targetDefaultStylesType, margin: MarginType) => void
}
const titleBgUrls = [
  'url("data:image/png;base64,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") center center no-repeat rgb(243, 244, 248)',
  'url("data:image/png;base64,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") center center no-repeat rgb(243, 244, 248)',
  'url("data:image/png;base64,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") center center no-repeat rgb(243, 244, 248)',
  'url("data:image/png;base64,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") center center no-repeat rgb(243, 244, 248)',
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAABECAYAAADOdtRvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LjE2NDY0OCwgMjAyMS8wMS8xMi0xNTo1MjoyOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjIgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjUwMEJCRUZFMzEwNjExRUVCODE0ODg3QzhDMUQ4RkE1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjUwMEJCRUZGMzEwNjExRUVCODE0ODg3QzhDMUQ4RkE1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NTAwQkJFRkMzMTA2MTFFRUI4MTQ4ODdDOEMxRDhGQTUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NTAwQkJFRkQzMTA2MTFFRUI4MTQ4ODdDOEMxRDhGQTUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6o6x+iAAAFA0lEQVR42uyc31HbWBSHrxkK8Faw3grWDDzxgl3BLhUEKkhcgaECSAVrVwCpAOeFJzPrVBCngvVW4D3H/O7mRpEV/5ElQ75vRmMhS8KDPx0dXaRfI4jj4+P509NTQ/Mde+mEfKa23kDrPeS8P7TpzZJte7btJF1g+3g3Ho9vA8CGHG65fSeKHw8Ee7l00bXoRlJHcafJun6Q9HWwIDFsLnFaTeO8idm1l9EqO8hWY9t2asta+rHt1VfzM3tvpm3+shdf50NBxQdYuRJfS6iO5tdCwqeV2HnQQTBStW26xDbFda8lOwLD9hKbTCPvSyXkSDJe/WC7UbLuwzK57b3YTjQl8//Vmj89lN0Tv5GQdznV+FdV6WHO9l5Rr5JKnJW/rZYBYKc98YUuvNoS2EU+UsWc6ZTfclltvpn0tV6BO/baz/TIO/mgj4+PfFuQy4FO80NJO5HAfvr/J7lAczm/WaZeuKvRiVGcTyuzeu0yW4c5E1NmWkg8if1trL4Se5D2rlo+SHvbzPyNV2ebFhU9VnCbLiTysASJG0xMmWlxYXeeaQeieL/l9cA2fbZ1ehK0pQodwtfxYBf23iYfRvMx49/VolxuY+/p6SnnTVjaTmTxEYXbvBEELXNB36mHnmk4rZVU9L6k9Ys+r+Yu/PtM1QYofXQixYWbqC1ohu//GXGdyNvTOjdqJz7oZ6/Kbe0j8sl/zvzb2ee7fA1QqsTJ+K/L+4cW95L3J3p/aPP3WjxI7rf4UvD7ZpnfNQsr/mcQYOmF0nw+568Ar64nBkBiACQGQGJAYgAkBkBiACQGJAZAYgAkBkBiQOIVOTk56TQajVDXBHBYwj78vuLK4q/0YGsrPN/WOQiZ2zsBiatio/grW+9vSfsxPN/r3LczQXc8Hk/4KpF43RaiLdFCWll3HX9lvI/VPNnH27Dl83vwc1Zir4yVx1+lAguvyGd8jUi8Nnb6XjxWZBW50virHM5CubkW8BP2xLXFX+kCz/d/VLQeyUFIXNQXX4Qa4q+Uc+GV+k/vhVe8qONBwlfMwYYCx9N8pfFX2seDDpxuTo+8DJJyXvG0TTsxsSrofXFIqq9XyEE60qDlA0kfRxH6ySiG51XMNBqRjb8aZNqRO13onScjFoWQHEQ7UXRhV2n8lXpgr8C/rCowIPG6FMZfmYQx/moaviYIucgTBX3HPrcXQ1kkbl8HTGxR7tL+2c8EdlCRIoTEpbDT+Cu1FiO+MtiZxLuOv1KF/67Kk2AExFjBi4f7iQGJAZAYAIkBiQGQGACJAZAYkBgAiQGQGACJAYlrJI2kqiMSC14+h3v2eSqPxLIDpxX0VImeWAEkrpxNI7Hi83pfJLxHYh0hMhKvjZ7aqCMS69Ln4/3UJvDn8PyM4C1aIPG6eGWsIxJrlvM5miiBxGEDAReRWCZfbZFYCkhsB4IJkXhLKo3Eim2MgmD8LHBu/fC06AMSiYXERT3tRag+Eiu2MS6xP9h6t2LWMQ8l7heNgz0QuJZILD8QvB0xaX1o7VLbv13lj8a0V9PetBMxQCUk1XfXkVhZPoUfZB0TiUU7UXRhV3UkVjNndMIF/ogSSFwWO4/E0gXkvfXB/+qi0vfDGPFLbIrrDk9J71/wMV7vadUGTFRpYyTWWRwP1shCXiTWVCMRPpqxLFHo3vvupNov2hnvjdGBSlxmizGSrJ2wg0isWNHt5YoEJCoxQO38J8AAgN2o8YZG8OsAAAAASUVORK5CYII=") center center no-repeat rgb(243, 244, 248)'
]
export type MarginType = {
  top: number
  bottom: number
  left: number
  right: number
}
const marginWarp = {
  //单位cm
  0: {
    //普通
    top: 2.54,
    bottom: 2.54,
    left: 3.18,
    right: 3.18
  },
  1: {
    // 窄
    top: 1.27,
    bottom: 1.27,
    left: 1.27,
    right: 1.27
  },
  2: {
    //适中
    top: 2.54,
    bottom: 2.54,
    left: 1.91,
    right: 1.91
  },
  3: {
    //宽
    top: 2.54,
    bottom: 2.54,
    left: 5.08,
    right: 5.08
  }
} as { [key: number]: MarginType }
const styleItems = [
  { text: 'AaBbCc', label: '正文', key: 'p' },
  { text: 'H1', label: '标题1', key: 'h1' },
  { text: 'H2', label: '标题2', key: 'h2' },
  { text: 'H3', label: '标题3', key: 'h3' },
  { text: 'H4', label: '标题4', key: 'h4' },
  { text: 'H5', label: '标题5', key: 'h5' },
  { text: 'H6', label: '标题6', key: 'h6' }
] as { text: string; label: string; key: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }[]
export type StyleType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type StyleKeys = 'title' | 'previewText' | 'fontSize' | 'lineHeight' | 'textAlign' | 'fontFamily' | 'textIndent' | 'fontWeight' | 'fontStyle' | 'color' | 'backgroundColor'

export type StyleProperties = {
  title: string
  previewText: string
  fontSize: string
  lineHeight: string
  textAlign: CSSProperties['textAlign']
  fontFamily: string
  textIndent: string
  fontWeight: string
  fontStyle: string
  color: string
  backgroundColor: string
}
export type targetDefaultStylesType = {
  [key in StyleType]: StyleProperties
}
const targetDefaultStyles = {
  p: {
    title: '正文',
    previewText: '示例文字，示例文字，示例文字，示例文字，示例文字',
    fontSize: '14px',
    lineHeight: '1.5',
    textAlign: 'left',
    fontFamily: '宋体, SimSun',
    textIndent: '2em',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  },
  h1: {
    title: '标题1',
    previewText: '标题1示例文字',
    fontSize: '28px',
    lineHeight: '1.5',
    textAlign: 'center',
    fontFamily: '黑体, SimHei',
    textIndent: '',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  },
  h2: {
    title: '标题2',
    previewText: '标题2示例文字',
    fontSize: '24px',
    lineHeight: '1.5',
    textAlign: 'left',
    fontFamily: '黑体, SimHei',
    textIndent: '',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  },
  h3: {
    title: '标题3',
    previewText: '标题3示例文字',
    fontSize: '20px',
    lineHeight: '1.5',
    textAlign: 'left',
    fontFamily: '黑体, SimHei',
    textIndent: '',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  },
  h4: {
    title: '标题4',
    previewText: '标题4示例文字',
    fontSize: '18px',
    lineHeight: '1.5',
    textAlign: 'left',
    fontFamily: '黑体, SimHei',
    textIndent: '',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  },
  h5: {
    title: '标题5',
    previewText: '标题5示例文字',
    fontSize: '16px',
    lineHeight: '1.5',
    textAlign: 'left',
    fontFamily: '黑体, SimHei',
    textIndent: '',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  },
  h6: {
    title: '标题6',
    previewText: '标题6示例文字',
    fontSize: '14px',
    lineHeight: '1.5',
    textAlign: 'left',
    fontFamily: '黑体, SimHei',
    textIndent: '',
    fontWeight: '',
    fontStyle: '',
    color: '#000000',
    backgroundColor: '#FFFFFF'
  }
} as targetDefaultStylesType
const StyleSetting: React.FC<IStyleSettingProps> = ({ open, onClose, onSubmit }) => {
  const [marginType, setMarginType] = useState(0)
  const [margin, setMargin] = useState(marginWarp[marginType])
  const [titleNumberStyle, setTitleNumberStyle] = useState<number>()
  const [targetKey, setTargetKey] = useState<StyleType>()
  const [visable, setVisable] = useState(false)
  const [targetDefaultStylesWarp, setTargetDefaultStylesWarp] = useState(targetDefaultStyles)
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => {
        onSubmit(targetDefaultStylesWarp, margin)
      }}
      okText="保存"
      cancelText="取消"
      width={1200}
      title="保存样式设置"
    >
      {visable && (
        <CustomStyleForm
          targetDefaultStyles={targetDefaultStylesWarp}
          setTargetDefaultStyles={setTargetDefaultStylesWarp}
          target={targetKey!}
          open={visable}
          onClose={() => setVisable(false)}
          onSubmit={(result) => {
            console.log(result, 'stylessss')
          }}
        />
      )}
      <div className="w-full py-7 px-5">
        <div className="export-item-title text-[16px]">文字样式</div>
        <ul className="content-style-con ">
          {styleItems.map((item, index) => {
            return (
              <li
                onClick={() => {
                  setTargetKey(item.key)
                  setVisable(true)
                }}
                className={`${titleNumberStyle === index ? 'active' : ''}`}
                key={item.key}
              >
                <span>{item.text}</span> <span>{item.label}</span>
              </li>
            )
          })}
        </ul>
        <div className="export-item-title text-[16px]">标题编号</div>
        <ul className="section-ol-con ">
          {titleBgUrls.map((url, index) => {
            return (
              <li
                onClick={() => setTitleNumberStyle(index)}
                className={`${titleNumberStyle === index ? 'active' : ''}`}
                key={index}
                style={{
                  background: url
                }}
              />
            )
          })}
        </ul>
        <div className="export-item-title text-[16px] mb-1">布局样式</div>
        <div className="flex items-center">
          页边距
          <Select
            value={marginType}
            onChange={(value) => {
              setMarginType(value)
              setMargin(marginWarp[value])
            }}
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 30
            }}
            options={[
              {
                label: '普通',
                value: 0
              },
              {
                label: '窄',
                value: 1
              },
              {
                label: '适中',
                value: 2
              },
              {
                label: '宽',
                value: 3
              }
            ]}
          />
          上
          <InputNumber
            style={{
              marginLeft: 10,
              marginRight: 20
            }}
            value={margin.top}
            formatter={(value) => `${value}cm`}
            onChange={(value) => setMargin({ ...margin, top: value ?? 0 })}
            step={0.1}
            controls={true}
          />
          下
          <InputNumber
            style={{
              marginLeft: 10,
              marginRight: 20
            }}
            value={margin.bottom}
            formatter={(value) => `${value}cm`}
            onChange={(value) => setMargin({ ...margin, bottom: value ?? 0 })}
            step={0.1}
            controls={true}
          />
          左
          <InputNumber
            style={{
              marginLeft: 10,
              marginRight: 20
            }}
            value={margin.left}
            formatter={(value) => `${value}cm`}
            onChange={(value) => setMargin({ ...margin, left: value ?? 0 })}
            step={0.1}
            controls={true}
          />
          右
          <InputNumber
            style={{
              marginLeft: 10
            }}
            value={margin.right}
            formatter={(value) => `${value}cm`}
            onChange={(value) => setMargin({ ...margin, right: value ?? 0 })}
            step={0.1}
            controls={true}
          />
        </div>
      </div>
    </Modal>
  )
}

export default StyleSetting
