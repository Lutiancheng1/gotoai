import { useState } from 'react'
import './index.css'
const models = ['Midjourney', 'Stable Diffusion']
export default function DrawDesigns() {
  const [currentModel, setCurrentModel] = useState('Midjourney')
  return (
    <div className="drawDesigns">
      {/* 左侧参数区域 */}
      <section className="draw-controller w-[300px] bg-white">
        {/* 两个模型 Midjourney  |  Stable Diffusion */}
        <ul className="draw-controller-tab menu menu-vertical lg:menu-horizontal rounded-box ">
          {models.map((item, index) => {
            return (
              <li key={index}>
                <button
                  onClick={() => {
                    setCurrentModel(item)
                  }}
                  className={`draw-controller-tab-item ${currentModel === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="draw-controller-item-title"></div>
      </section>
      {/* 右侧 */}
      <section className="draw-container w-[calc(100%_-_300px)]"></section>
    </div>
  )
}
