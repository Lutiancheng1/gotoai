import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { Form, Select, Input, Row, Col, Tooltip, InputNumber, Modal, Button, ColorPicker } from 'antd'
import { StyleType, targetDefaultStylesType } from '.'
import { useMount } from 'ahooks'
const fontFamilyOptions = [
  { label: '宋体', value: '宋体, SimSun' },
  { label: '微软雅黑', value: '微软雅黑, "Microsoft YaHei"' },
  { label: '楷体', value: '楷体, SimKai' },
  { label: '楷体GB2312', value: '楷体_GB2312' },
  { label: '黑体', value: '黑体, SimHei' },
  { label: '隶书', value: '隶书, SimLi' },
  { label: '仿宋', value: 'fangsong' },
  { label: '仿宋GB2312', value: '仿宋_GB2312' },
  { label: 'andaleMono', value: '"andale mono"' },
  { label: 'arial', value: 'arial, helvetica, sans-serif' },
  { label: 'arialBlack', value: '"arial black", "avant garde"' },
  { label: 'comicSansMs', value: '"comic sans ms"' },
  { label: 'impact', value: 'impact, chicago' },
  { label: 'timesNewRoman', value: '"times new roman"' }
]
const fontSizeOptions = [
  { label: '初号', value: '42px' },
  { label: '小初', value: '36px' },
  { label: '一号', value: '26px' },
  { label: '小一', value: '24px' },
  { label: '二号', value: '22px' },
  { label: '小二', value: '18px' },
  { label: '三号', value: '16px' },
  { label: '小三', value: '15px' },
  { label: '四号', value: '14px' },
  { label: '小四', value: '12px' },
  { label: '五号', value: '10.5px' },
  { label: '小五', value: '9px' },
  { label: '六号', value: '7.5px' },
  { label: '小六', value: '6.5px' },
  { label: '七号', value: '5.5px' },
  { label: '八号', value: '5px' },
  { label: '8px', value: '8px' },
  { label: '10px', value: '10px' },
  { label: '11px', value: '11px' },
  { label: '20px', value: '20px' },
  { label: '28px', value: '28px' },
  { label: '48px', value: '48px' },
  { label: '56px', value: '56px' },
  { label: '72px', value: '72px' }
]
const alignmentOptions = [
  { label: '靠左', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '靠右', value: 'right' },
  { label: '两端', value: 'justify' }
]
type CustomStyleProps = {
  target: StyleType
  open: boolean
  onClose: () => void
  onSubmit: (result: targetDefaultStylesType) => void
  targetDefaultStyles: targetDefaultStylesType
  setTargetDefaultStyles: React.Dispatch<React.SetStateAction<targetDefaultStylesType>>
}

const CustomStyleForm: React.FC<CustomStyleProps> = ({ open, onClose, onSubmit, target, targetDefaultStyles, setTargetDefaultStyles }) => {
  const defaultStyles = useRef(targetDefaultStyles[target])
  useMount(() => {
    defaultStyles.current = targetDefaultStyles[target]
  })
  const onOk = () => {
    onSubmit(targetDefaultStyles)
    onClose()
  }
  const onCancel = () => {
    onClose()
    // 取消 时恢复默认样式
    setTargetDefaultStyles({ ...targetDefaultStyles, [target]: defaultStyles.current })
  }
  return (
    <Modal open={open} onCancel={onCancel} onOk={onOk} title={'修改样式'} okText="保存" cancelText="取消">
      <div className="px-4 py-6">
        <div className="mb-4 text-[16px] font-600">{targetDefaultStyles[target].title}</div>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fontFamily" label="字体" initialValue={targetDefaultStyles[target].fontFamily}>
                <Select options={fontFamilyOptions} optionRender={({ label, value }) => <span style={{ fontFamily: value as string }}>{label}</span>} onChange={(value) => setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], fontFamily: value } })}></Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fontSize" label="字号" initialValue={targetDefaultStyles[target].fontSize}>
                <Select options={fontSizeOptions} optionRender={({ label, value }) => <span title={value as string}>{label}</span>} onChange={(value) => setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], fontSize: value } })}></Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lineHeight" label="行间距" initialValue={targetDefaultStyles[target].lineHeight}>
                <InputNumber formatter={(value) => `${value} 倍`} onChange={(value) => setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], lineHeight: (value as string) ?? '' } })} step={0.1} controls={true} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="textAlign" label="对齐方式" initialValue={targetDefaultStyles[target].textAlign}>
                <Select options={alignmentOptions} onChange={(value) => setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], textAlign: value } })}></Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <div className="flex w-full h-full items-center">
                <div className="mt-[7px] flex gap-3">
                  <Button
                    type="default"
                    title="增加缩进"
                    icon={<i className="iconfont icon-zengjiasuojin1" />}
                    onClick={() => {
                      // 每次增加 2 初始值为 text-indent: 2em;
                      setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], textIndent: targetDefaultStyles[target].textIndent === '' ? '2em' : parseInt(targetDefaultStyles[target].textIndent) + 2 + 'em' } })
                    }}
                  ></Button>
                  <Button
                    type="default"
                    title="减少缩进"
                    icon={<i className="iconfont icon-jianshaosuojin1" />}
                    onClick={() => {
                      // 每次减少 2 最小值为0 不可以为负
                      if (parseInt(targetDefaultStyles[target].textIndent) - 2 < 0 || targetDefaultStyles[target].textIndent === '') return setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], textIndent: '' } })
                      setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], textIndent: parseInt(targetDefaultStyles[target].textIndent) - 2 + 'em' } })
                    }}
                  ></Button>
                  <Button
                    type="default"
                    title="加粗"
                    icon={<i className="iconfont icon-zitijiacu" />}
                    className={`${targetDefaultStyles[target].fontWeight === 'bold' ? ' border-[#4096ff] text-[#4096ff]' : ''}`}
                    onClick={() => {
                      if (targetDefaultStyles[target].fontWeight === 'bold') {
                        setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], fontWeight: '' } })
                      } else {
                        setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], fontWeight: 'bold' } })
                      }
                    }}
                  ></Button>
                  <Button
                    type="default"
                    title="斜体"
                    icon={<i className="iconfont icon-italic" />}
                    className={`${targetDefaultStyles[target].fontStyle === 'italic' ? ' border-[#4096ff] text-[#4096ff]' : ''}`}
                    onClick={() => {
                      if (targetDefaultStyles[target].fontStyle === 'italic') {
                        setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], fontStyle: '' } })
                      } else {
                        setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], fontStyle: 'italic' } })
                      }
                    }}
                  ></Button>
                  <ColorPicker
                    showText
                    onChangeComplete={(color) => {
                      setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], color: color.toHexString() } })
                    }}
                    allowClear
                    defaultValue={targetDefaultStyles[target].color}
                  >
                    <Button type="default" title="文字颜色" icon={<i className="iconfont icon-wenziyanse" />}></Button>
                  </ColorPicker>
                  <ColorPicker
                    showText
                    onChangeComplete={(color) => {
                      setTargetDefaultStyles({ ...targetDefaultStyles, [target]: { ...targetDefaultStyles[target], backgroundColor: color.toHexString() } })
                    }}
                    allowClear
                    defaultValue={targetDefaultStyles[target].backgroundColor}
                  >
                    <Button type="default" title="背景颜色" icon={<i className="iconfont icon-beijingyanse" />}></Button>
                  </ColorPicker>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
        <div style={{ marginTop: 20 }}>
          <div
            title="预览效果"
            style={{
              padding: '10px',
              border: '1px solid #d9d9d9',
              overflowY: 'auto',
              borderRadius: '4px',
              height: '200px',
              ...targetDefaultStyles[target],
              backgroundColor: ''
            }}
          >
            <span
              style={{
                backgroundColor: targetDefaultStyles[target].backgroundColor
              }}
            >
              {targetDefaultStyles[target].previewText}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CustomStyleForm
