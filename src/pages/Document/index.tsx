import History from '@/components/history'
import React from 'react'
import './index.css'
import pdfIcon from '@/assets/images/pdf-session.svg'
export default function Document() {
  return (
    <div className="document">
      <History title="文档对话" title_Icon={true} item_Icon={<img src={pdfIcon} alt="" />} />
    </div>
  )
}
