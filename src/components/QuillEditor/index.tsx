import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css' // 或者 'quill/dist/quill.bubble.css'
import './index.css'

// 定义中文 title 的配置对象
export const titleConfig: Record<string, string> = {
  '.ql-bold': '加粗',
  '.ql-color': '颜色',
  '.ql-font': '字体',
  '.ql-code': '插入代码',
  '.ql-italic': '斜体',
  '.ql-link': '添加链接',
  '.ql-background': '背景颜色',
  '.ql-size': '字号',
  '.ql-strike': '删除线',
  '.ql-script[value="super"]': '上标',
  '.ql-script[value="sub"]': '下标',
  '.ql-underline': '下划线',
  '.ql-blockquote': '引用',
  '.ql-header': '标题',
  '.ql-code-block': '代码块',
  '.ql-list[value="ordered"]': '有序列表',
  '.ql-list[value="bullet"]': '无序列表',
  '.ql-indent[value="+1"]': '增加缩进',
  '.ql-indent[value="-1"]': '减少缩进',
  '.ql-direction': '文本方向',
  '.ql-formula': '插入公式',
  '.ql-image': '插入图片',
  '.ql-video': '插入视频',
  '.ql-clean': '清除字体样式'
}
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    [{ direction: 'rtl' }], // text direction

    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ['clean'] // remove formatting button
  ],
  clipboard: {
    matchVisual: false
  }
}

const formats = ['bold', 'italic', 'underline', 'strike', 'align', 'list', 'indent', 'size', 'header', 'link', 'image', 'video', 'color', 'background']

const QuillEditor: React.ForwardRefRenderFunction<{}, {}> = (props, ref) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)

  useEffect(() => {
    if (!editorRef.current) return
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules,
      formats,
      readOnly: false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const addTitle = () => {
    // 获取工具栏的容器元素
    const toolbar = document.querySelector('.ql-toolbar')
    if (toolbar) {
      // 遍历配置对象的键值对
      for (let key in titleConfig) {
        if (titleConfig.hasOwnProperty(key)) {
          // 获取对应的按钮元素
          const button: HTMLButtonElement | null = toolbar.querySelector(key)
          // 判断是否存在
          if (button) {
            // 给按钮元素添加 title 属性，值为配置对象的值
            button.title = titleConfig[key]
          }
        }
      }
    }
  }
  useEffect(() => {
    setTimeout(() => addTitle(), 100)
  }, [])

  useImperativeHandle(ref, () => ({
    setContent: (content: string) => {
      if (quillRef.current) {
        quillRef.current.clipboard.dangerouslyPasteHTML(content)
      }
    },
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.getText()
      }
      return ''
    }
  }))

  return <div ref={editorRef}></div>
}

export default forwardRef(QuillEditor)
