import { Button, Input, Radio, Switch, Tooltip } from 'antd'
import { InfoCircleOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import sunoJpg from '@/assets/images/suno.jpg'
import './index.css'
import { useState } from 'react'
// 歌曲流派
const songGenre = [
  { name: '流行', value: '流行', icon: '' },
  { name: '说唱', value: '说唱', icon: '' },
  { name: 'R&B', value: 'R&B', icon: '' },
  { name: '后摇', value: '后摇', icon: '' },
  { name: '古风', value: '古风', icon: '' },
  { name: '电子', value: '电子', icon: '' },
  { name: '摇滚', value: '摇滚', icon: '' },
  { name: '布鲁斯', value: '布鲁斯', icon: '' },
  { name: '新世纪', value: '新世纪', icon: '' },
  { name: '中国风', value: '中国风', icon: '' },
  { name: '民谣', value: '民谣', icon: '' },
  { name: '爵士', value: '爵士', icon: '' },
  { name: '金属', value: '金属', icon: '' },
  { name: '古典风', value: '古典风', icon: '' },
  { name: '乡村', value: '乡村', icon: '' }
]
// 歌曲心情
const songMood = [
  { name: '快乐', value: '快乐', icon: '' },
  { name: '伤感', value: '伤感', icon: '' },
  { name: '思念', value: '思念', icon: '' },
  { name: '安静', value: '安静', icon: '' },
  { name: '治愈', value: '治愈', icon: '' },
  { name: '宣泄', value: '宣泄', icon: '' },
  { name: '励志', value: '励志', icon: '' },
  { name: '寂寞', value: '寂寞', icon: '' },
  { name: '甜蜜', value: '甜蜜', icon: '' }
]
const MusicCreation: React.FC<{}> = () => {
  // 创作模式
  const [creativeMode, setCreativeMode] = useState<'professional' | 'simple'>('professional')
  // 歌曲名称
  const [musicName, setMusicName] = useState('')
  // 歌曲歌词
  const [musicLrc, setMusicLrc] = useState('')
  // 自定义歌曲风格
  const [customStyle, setCustomStyle] = useState(false)
  // 歌曲风格
  const [musicStyle, setMusicStyle] = useState('')
  // 歌曲流派
  const [musicGenre, setMusicGenre] = useState('')
  // 歌曲心情
  const [musicMood, setMusicMood] = useState('')
  // 歌曲描述
  const [musicDesc, setMusicDesc] = useState('')
  // 是否纯音乐
  const [pureMusic, setPureMusic] = useState(false)
  return (
    <div className="music flex w-full h-full">
      <div className="w-[230px] music-control bg-white">
        <div className="h-[calc(100vh-90px)] px-3 pt-3 nw-no-scroll overflow-auto">
          <div className="mb-4">
            <div className="mb-2 flex items-center text-sm required">创作模型</div>
            <div className="creative-model flex items-center justify-between space-x-1">
              <button className="model-item w-1/2 h-[45px] suno rounded border-2 active"></button>
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-2 flex items-center text-sm required">创作模式</div>
            <Radio.Group defaultValue={creativeMode} onChange={(e) => setCreativeMode(e.target.value)}>
              <Radio.Button value="professional">专业模式</Radio.Button>
              <Radio.Button value="simple">简易模式</Radio.Button>
            </Radio.Group>
          </div>
          {creativeMode === 'professional' ? (
            <>
              <div className="mb-4">
                <div className="mb-2 flex items-center text-sm">歌曲标题</div>
                <Input value={musicName} placeholder="请输入20字以内的歌曲名称" onChange={(e) => setMusicName(e.target.value)} />
              </div>
              <div className="mb-4">
                <div className="mb-2 flex items-center text-sm">歌曲歌词</div>
                <div className="max-h-[400px] overflow-auto nw-no-scroll">
                  <Input.TextArea
                    className="lrc-textarea nw-scrollbar  "
                    count={{
                      show: true,
                      max: 1200
                    }}
                    maxLength={1200}
                    value={musicLrc}
                    placeholder="请输入歌曲歌词"
                    onChange={(e) => setMusicLrc(e.target.value)}
                    autoSize={{
                      minRows: 6
                    }}
                  />
                </div>
              </div>
              <div className="custom-song-style flex items-center mb-4 justify-between">
                <div>自定义歌曲风格</div>
                <Switch className="bg-gray-300" value={customStyle} onChange={setCustomStyle} />
              </div>
              {!customStyle && (
                <>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center text-sm">歌曲流派</div>
                    <div className="w-full grid grid-cols-3 gap-4">
                      {songGenre.map((item) => {
                        return (
                          <button key={item.value} className={`relative overflow-hidden rounded-md border-2 py-1 ${musicGenre === item.name ? 'border-[#1677ff]' : ''}`} onClick={() => setMusicGenre(item.name)}>
                            {item.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center text-sm">歌曲心情</div>
                    <div className="w-full grid grid-cols-3 gap-4">
                      {songMood.map((item) => {
                        return (
                          <button key={item.value} className={`relative overflow-hidden rounded-md border-2 py-1 ${musicMood === item.name ? 'border-[#1677ff]' : ''}`} onClick={() => setMusicMood(item.name)}>
                            {item.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {customStyle && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center text-sm required">歌曲风格</div>
                  <div>
                    <Input.TextArea
                      count={{
                        show: true,
                        max: 200
                      }}
                      maxLength={1200}
                      value={musicStyle}
                      placeholder="请输入歌曲风格,例如伤感、流行、钢琴..."
                      onChange={(e) => setMusicStyle(e.target.value)}
                      autoSize={{
                        minRows: 4
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="mb-2 flex items-center text-sm required">歌曲描述</div>
                <div>
                  <Input.TextArea
                    count={{
                      show: true,
                      max: 200
                    }}
                    maxLength={1200}
                    value={musicDesc}
                    placeholder="描述您的歌曲的风格、想表达的含义等"
                    onChange={(e) => setMusicDesc(e.target.value)}
                    autoSize={{
                      minRows: 4
                    }}
                  />
                </div>
              </div>
              <div className="pure flex items-center mb-4 justify-between pt-4">
                <div>纯音乐</div>
                <Switch className="bg-gray-300" value={pureMusic} onChange={setPureMusic} />
              </div>
            </>
          )}
        </div>
        <div className="px-4">
          <Button type="primary" className="bg-[#1677ff] w-full">
            立即创作
          </Button>
        </div>
      </div>
      <div className="w-[calc(100%-230px)] music-content p-4 overflow-y-auto nw-scrollbar">
        <header className="mb-3">
          <div className="title text-lg">AI音乐创作</div>
          <div className="subtitle mb-2">音乐创作平台-轻松一点，打造专属音乐作品</div>
        </header>
      </div>
    </div>
  )
}
export default MusicCreation
