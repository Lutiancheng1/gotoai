import React, { useEffect, useState } from 'react'
import './index.css'
import { useLocation } from 'react-router-dom'
import { menuWarp } from '@/utils/constants'
import { getMenuPrologue } from '@/api/prologue'
import { PrologueInfo } from '@/store/types'
import { UserPrompt } from '@/pages/Talk'
const titleWarp = {
  2: '代码编程助手',
  3: '知识库助手',
  4: '数据分析助手',
  6: '视频助手'
} as {
  [key: number]: string
}
export default function InitPage({ onPromptClick }: { onPromptClick: (item: UserPrompt) => void }) {
  const location = useLocation()
  const [initPrologue, setInitPrologue] = useState<PrologueInfo>()
  // 获取开场白信息
  useEffect(() => {
    const pathname = location.pathname
    const getData = async () => {
      const res = await getMenuPrologue(menuWarp[pathname])
      if (!res.data) return
      setInitPrologue(res.data)
    }
    getData()
  }, [location.pathname])
  return initPrologue ? (
    <div className="init_page animate__animated animate__fadeIn animate__faster">
      <div className="title-box">
        <p className="title">{titleWarp[initPrologue?.menu]}</p>
        <p className="sub-title"> {initPrologue?.content} </p>
      </div>
      <div className="example">
        <h5>试试以下例子：</h5>
        {initPrologue &&
          initPrologue.examples.map((item) => {
            return (
              <p
                dangerouslySetInnerHTML={{
                  __html: item.replaceAll('\n', '<br/>')
                }}
                onClick={() => onPromptClick({ ...initPrologue, title: item, prologue: initPrologue?.content, content: item })}
                key={item}
                title={item}
              ></p>
            )
          })}
      </div>
    </div>
  ) : null
}
