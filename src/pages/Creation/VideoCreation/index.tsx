import { Button, Checkbox, ColorPicker, Input, Select, Tooltip, Upload } from 'antd'
import './index.css'
import { useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import AudioSelect from './components/AudioSelect'
import React from 'react'

// videoSettings audioSettings subtitleSettings
function getFontName(fontName: string) {
  // 这里需要你自己实现字体名称到中文名称的映射
  switch (fontName) {
    case 'MicrosoftYaHeiBold.ttc':
      return '微软雅黑粗体'
    case 'MicrosoftYaHeiNormal.ttc':
      return '微软雅黑'
    case 'STHeitiLight.ttc':
      return '黑体-简-细体'
    case 'STHeitiMedium.ttc':
      return '黑体-简-中等'
    case 'UTM Kabel KT.ttf':
      return 'UTM Kabel KT'
    default:
      return fontName
  }
}
//  randomTheme
const randomTheme = ['环保生活小贴士：回收、节能灯泡、无塑料、节水', '个人理财：预算、储蓄、投资、信用卡管理 ', '智能家居：语音助手、自动化、安全监控、节能', '居家健身指南：瑜伽、HIIT、拉伸、力量训练', '心理健康：冥想、日记、阅读、深呼吸']
// randomCopywriting
const randomCopywriting = [
  `生命，这个宇宙中最神奇的奇迹，它的意义究竟是什么？
或许，生命的意义，在于那些温暖人心的瞬间，连接彼此的纽带，传递爱与希望。
它也许在于，为这个世界留下我们的痕迹，无论是一棵树，一篇文章，还是一个微笑。
生命的意义，在于探索、连接、贡献。最终，它在于我们如何定义它。在这短暂而宝贵的旅程中，让我们用爱和勇气，书写自己的故事。`,
  `在这个快节奏的生活里，我们常常忘了停下脚步，寻找那些让心灵微笑的瞬间。
从今天开始，给自己的生活增添一抹色彩。尝试一项新的爱好，无论是画画、烹饪，还是学习一门新乐器。
找回与家人朋友共度的欢乐时光。在自然中放松身心，让爱和笑声充满你的每一天。
偶尔，给自己一点独处的时间。在星空下散步，或是静静地阅读一本书，找到属于自己的平静。
生活的乐趣无处不在，只要你愿意去发现。今天，就从一个小小的改变开始，让我们的生活更加丰富多彩。`,
  `在这个充满挑战的时代，保持心理健康变得比以往任何时候都重要。
冥想，是连接内心深处的桥梁，它帮助我们减少焦虑，增强自我意识，让心灵得到真正的安宁。
通过写日记，我们能够更好地理解自己的情绪与想法，这是一种释放内心压力、提升自我认知的有效方法。
阅读，不仅可以开阔我们的视野，还能带我们进入另一个世界，暂时忘却现实的烦恼，享受心灵的宁静。
深呼吸，一个简单而强大的工具。它能迅速缓解紧张情绪，让我们的心灵回归平和。
冥想、日记、阅读、深呼吸，这些简单的实践能极大地提升我们的心理健康。让我们从今天开始，为心灵种下幸福与平和的种子。`,
  `在这个快速变化的世界中，理解个人理财的重要性，对我们每个人来说都至关重要。
预算，是个人理财的基石。它帮助我们控制开支，确保我们的收入能满足我们的需求和目标。
储蓄，是为未来的不确定性建立安全网。无论是应急基金还是长期目标，储蓄都是实现财务自由的关键步骤。
投资，让我们的钱为我们工作。通过明智的投资选择，我们可以让我们的资产随着时间增长。
信用卡管理，是维护良好信用记录和避免高利债务的关键。合理使用信用卡可以帮我们建立信用，享受更多财务自由。
通过有效的预算、储蓄、投资和信用卡管理，我们不仅能应对今天的挑战，还能为未来打下坚实的基础。让我们从现在开始，走向财务自由之路。`
]
const VideoCreation: React.FC<{}> = () => {
  // 视频主题
  const [video_subject, setVideo_subject] = useState('')
  // 视频文案
  const [video_script, setVideo_script] = useState('')
  // 设置是否展开
  const [expand, setExpand] = useState(false)
  // 画面比例
  const [video_aspect, setVideo_aspect] = useState('16:9')
  // 视频来源
  const [video_materials, setVideo_materials] = useState({
    provider: 'pexels',
    url: '',
    duration: 0
  })
  // 视频拼接模式
  const [video_concat_mode, setVideo_concat_mode] = useState<'random' | 'sequential'>('random')
  // 视频片段最大时长(秒)（不是视频总长度，是指每个合成片段的长度）
  const [video_clip_duration, setVideo_clip_durationn] = useState<2 | 3 | 4 | 5 | 6>(3)
  // 同时生成视频数量
  const [video_count, setVideo_count] = useState<1 | 2 | 3 | 4 | 5>(1)
  // 朗读音频名称
  const [voice_name, setVoice_name] = useState('')
  //音频音量
  const [voice_volume, setVoice_volume] = useState(1.0)
  // 背景音乐 random 随机  custom 自定义 none 无
  const [bgm_type, setBgm_type] = useState('random')
  // 自定义的bgm的文件
  const [bgm_file, setBgm_file] = useState('')
  // 背景音乐音量
  const [bgm_volume, setBgm_volume] = useState(0.2)
  // 是否启用字幕
  const [subtitle_enabled, setSubtitle_enabled] = useState(true)
  // 字幕字体
  const [font_name, setFont_name] = useState('STHeitiMedium.ttc')
  // 字幕位置
  const [subtitle_position, setSubtitle_position] = useState('bottom')
  // 字幕颜色 text_fore_color
  const [text_fore_color, setText_fore_color] = useState('#ffffff')
  // 字幕大小 font_size
  const [font_size, setFont_size] = useState(40)
  // 字幕背景颜色 text_background_color
  const [text_background_color, setText_background_color] = useState('transparent')
  // 描边颜色 stroke_color
  const [stroke_color, setStroke_color] = useState('#333333')
  // 描边粗细 stroke_width
  const [stroke_width, setStroke_width] = useState(1)
  // 示例文案
  const [copywritingIndex, setCopywritingIndex] = useState(0)
  const randomCopywritingClick = () => {
    setVideo_script(randomCopywriting[copywritingIndex])
    setCopywritingIndex((copywritingIndex + 1) % randomCopywriting.length)
  }
  // 随机主题
  const [themeIndex, setThemeIndex] = useState(0)
  const randomThemeClick = () => {
    setVideo_subject(randomTheme[themeIndex])
    setThemeIndex((themeIndex + 1) % randomTheme.length)
  }
  const onSubmit = async () => {
    // 打印所有参数 整个成一个对象
    console.log({
      video_subject,
      video_script,
      video_aspect,
      video_materials,
      video_concat_mode,
      video_clip_duration,
      video_count,
      voice_name,
      voice_volume,
      bgm_type,
      bgm_file,
      bgm_volume,
      subtitle_enabled,
      font_name,
      subtitle_position,
      text_fore_color,
      font_size,
      text_background_color,
      stroke_color,
      stroke_width
    })
  }
  // 视频设置
  const videoSettings = [
    {
      label: '画面比例',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' }
      ],
      type: 'box',
      onChange: (value: string | number) => setVideo_aspect(value as string),
      default: video_aspect,
      description: ''
    },
    {
      label: '视频来源',
      options: [
        { value: 'pexels', label: 'Pexels' },
        { value: 'localFiles', label: '本地文件' },
        { value: 'douyin', label: '抖音(支持中,敬请期待)' },
        { value: 'bilibili', label: '哔哩哔哩(支持中,敬请期待)' },
        { value: 'smallRedBook', label: '小红书(支持中,敬请期待)' }
      ],
      type: 'select',
      onChange: (value: string | number) => setVideo_materials({ ...video_materials, provider: value as string }),
      default: video_materials.provider,
      description: ''
    },
    {
      label: '拼接模式',
      options: [
        { value: 'random', label: '随机拼接（推荐）' },
        { value: 'sequential', label: '顺序拼接' }
      ],
      type: 'select',
      onChange: (value: string | number) => setVideo_concat_mode(value as 'random' | 'sequential'),
      default: video_concat_mode,
      description: '视频拼接模式'
    },
    {
      label: '片段时长',
      options: Array.from({ length: 5 }, (_, i) => i + 2).map((value) => ({ value, label: value })),
      type: 'select',
      onChange: (value: string | number) => setVideo_clip_durationn(Number(value) as 2 | 3 | 4 | 5 | 6),
      default: video_clip_duration,
      description: '视频片段最大时长(秒)不是视频总长度，是指每个合成片段的长度'
    },
    {
      label: '生成数量',
      options: Array.from({ length: 5 }, (_, i) => i + 1).map((value) => ({ value, label: value })),
      default: video_count,
      type: 'select',
      onChange: (value: string | number) => setVideo_count(Number(value) as 1 | 2 | 3 | 4 | 5),
      description: '同时生成视频数量'
    }
  ]
  // 音频设置
  const audioSettings = [
    {
      label: '朗读声音',
      options: [],
      type: 'select',
      onChange: (value: string | number) => setVoice_name(value as string),
      default: voice_name,
      description: ''
    },
    {
      label: '朗读音量',
      options: [0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 4.0, 5.0].map((value) => ({ value: value.toFixed(1), label: value.toFixed(1) })),
      type: 'select',
      onChange: (value: string | number) => setVoice_volume(Number(value) as number),
      default: voice_volume.toFixed(1),
      description: '(1.0表示100%)'
    },
    {
      label: '背景音乐',
      options: [
        {
          value: 'none',
          label: '无背景音乐'
        },
        {
          value: 'random',
          label: '随机背景音乐'
        },
        {
          value: 'custom',
          label: '自定义'
        }
      ],
      type: 'select',
      onChange: (value: string | number) => setBgm_type(value as string),
      default: bgm_type,
      description: ''
    },
    {
      label: '背景音乐音量',
      options: Array.from({ length: 11 }, (_, i) => {
        const value = i / 10
        return { value: value.toFixed(1), label: value.toFixed(1) }
      }),
      type: 'select',
      onChange: (value: string | number) => setBgm_volume(Number(value) as number),
      default: bgm_volume,
      description: '(0.2表示20%，背景声音不宜过高)'
    }
  ]
  // 字幕设置
  const subtitleSettings = [
    {
      label: '启用字幕',
      options: [],
      type: ['checkbox'],
      onChange: [(value: boolean) => setSubtitle_enabled(value)],
      default: [subtitle_enabled]
      // description: '若取消勾选，下面的设置都将不生效'
    },
    {
      label: '字幕字体',
      options: [['MicrosoftYaHeiBold.ttc', 'MicrosoftYaHeiNormal.ttc', 'STHeitiLight.ttc', 'STHeitiMedium.ttc', 'UTM Kabel KT.ttf'].map((value) => ({ value, label: getFontName(value) })), [20, 24, 28, 32, 36, 40, 46, 52, 58, 64, 70, 80].map((value) => ({ value, label: value + 'px' })), []],
      type: ['select', 'select', 'ColorPicker'],
      onChange: [(value: string | number) => setFont_name(value as string), (value: string | number) => setFont_size(Number(value) as number), (value: string | number) => setText_fore_color(value as string)],
      default: [getFontName(font_name), font_size, text_fore_color],
      description: ''
    },
    {
      label: '字幕边框',
      options: [[], Array.from({ length: 10 }, (_, i) => i + 1).map((value) => ({ value, label: value + 'px' }))],
      type: ['ColorPicker', 'select'],
      onChange: [(value: string | number) => setStroke_color(value as string), (value: string | number) => setStroke_width(Number(value) as number)],
      default: [stroke_color, stroke_width],
      description: ''
    },
    {
      label: '字幕位置',
      options: [
        [
          {
            value: 'bottom',
            label: '底部'
          },
          {
            value: 'center',
            label: '居中'
          },
          {
            value: 'top',
            label: '顶部'
          }
        ]
      ],
      type: ['select'],
      onChange: [(value: string | number) => setSubtitle_position(value as string)],
      default: [subtitle_position],
      description: ''
    }
  ]
  return (
    <div className="video-creation bg-[#f6f7f9] overflow-scroll nw-scrollbar w-full h-full">
      <div className="ml-1 mb-10">
        <p>基于强大的类似Sora AI模型，任意文本、图片都能快速生成高质量视频。无论是新手小白，还是对视频有高标准严要求的专业人士，GotoAI视频生成器都能轻松满足您的需求，让每一个想法都大放异彩，适用于抖音，快手，西瓜视频，今日头条视频。</p>
      </div>
      <div className="flex flex-col flex-1  w-full rounded-[20px] p-[16px] lg:p-[20px] relative">
        <div className="flex flex-col">
          <div className="flex gap-[16px]">
            <div className="dropdown">
              <Button type="primary" tabIndex={0} role="button" className="bg-[#1677ff] h-10" icon={<i className="iconfont icon-mobang"></i>} shape="round">
                AI帮我写
              </Button>
              <div tabIndex={0} className="dropdown-content mt-[10px] z-[1000] menu p-2 shadow bg-base-100 rounded-box w-[600px]">
                <Input.TextArea value={video_subject} onChange={(e) => setVideo_subject(e.target.value)} variant="borderless" className="" autoSize={{ minRows: 3 }} placeholder="输入视频主题，一键生成视频文案" />
                <div className="flex flex-row items-center justify-between w-full h-[40px] px-[6px] pb-6px">
                  <Button onClick={randomThemeClick} type="default" icon={<i className="iconfont icon-suijibofang"></i>} shape="round">
                    随机主题
                  </Button>
                  <Button disabled={!video_subject} type="primary" tabIndex={0} role="button" className="bg-[#1677ff] h-10" icon={<i className="iconfont icon-mobang"></i>} shape="round">
                    生成
                  </Button>
                </div>
              </div>
            </div>

            <Button type="primary" onClick={randomCopywritingClick} className="bg-[#1677ff] h-10" icon={<i className="iconfont icon-suijibofang"></i>} shape="round">
              示例
            </Button>
          </div>
          <div className="mt-4 relative ">
            <Input.TextArea value={video_script} onChange={(e) => setVideo_script(e.target.value)} showCount maxLength={5000} className="rounded-[20px]  video_textarea !px-3 !pt-3 !pb-8" autoSize={{ minRows: 8 }} placeholder="输入视频文案 或 使用AI帮写服务自动生成文案" />
          </div>
          <div
            className="flex justify-between mt-[20px] items-center"
            style={{
              color: expand ? '#1677FF' : '#8C8B99'
            }}
          >
            <div className="cursor-pointer text-16 font-500 flex items-center" onClick={() => setExpand(!expand)}>
              <i className="iconfont icon-shezhi !text-26 mr-1" /> 设置
            </div>
            <Button onClick={onSubmit} disabled={!video_script} type="primary" className="bg-[#1677ff] w-[180px] h-10" shape="round">
              生成
            </Button>
          </div>
          <div
            style={{
              display: expand ? 'flex' : 'none'
            }}
            className="flex py-5 text-12 2xl:text-[16px] px-6 2xl:px-[30px] rounded-[16px] mt-[12px] flex-col lg:flex-row"
          >
            {/* 视频设置 */}
            <div>
              <span className="text-[#8C8B99]/[0.6]">视频设置</span>
              <div className="mt-4 grid grid-rows-2 grid-cols-[auto_auto] justify-between items-center gap-4">
                {videoSettings.map((item) => {
                  return (
                    <React.Fragment key={item.label}>
                      <div className="text-end min-w-[64px]">
                        {item.label}
                        {item.description && (
                          <Tooltip title={item.description}>
                            <InfoCircleOutlined className="ml-1" rotate={180} />
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {item.type === 'box' &&
                          item.options.map((option) => {
                            return (
                              <div
                                key={option.label}
                                onClick={() => item.onChange(option.value)}
                                style={{
                                  borderColor: option.value === video_aspect ? '#1677FF' : '#d9d9d9'
                                }}
                                className="w-[93px] h-[36px] 2xl:h-44px border rounded-[8px] flex flex-row items-center justify-center gap-[8px] cursor-pointer"
                              >
                                <div className={`${option.value === '9:16' && 'rotate-90'} border-2 border-current w-[18px] h-[10px] rounded-[2px]`} /> {option.value}
                              </div>
                            )
                          })}
                        {item.type === 'select' && <Select onChange={item.onChange} style={{ width: '100%' }} defaultValue={item.default} options={item.options.map((option) => ({ value: String(option.value), label: String(option.label) }))} />}
                      </div>
                      {item.label === '视频来源' && video_materials.provider === 'localFiles' && (
                        <>
                          <div className="text-end min-w-[64px]">本地文件路径</div>
                          <div className="flex gap-4">
                            <Upload
                              fileList={[]}
                              accept={'.mp4'}
                              customRequest={(options) => {
                                console.log(options)
                              }}
                            >
                              <Input
                                style={{
                                  width: 202
                                }}
                                className="cursor-pointer"
                                readOnly
                                placeholder="点击上传"
                              />
                            </Upload>
                          </div>
                        </>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
            <div className="item">
              <div className="w-[2px] h-[70px] bg-[#101215] hidden xl:block" />
            </div>
            {/* 音频设置 */}
            <div>
              <span className="text-[#8C8B99]/[0.6]">音频设置</span>
              <div className="mt-4 grid grid-rows-2 grid-cols-[auto_auto] justify-between items-center gap-4">
                {audioSettings.map((item) => {
                  return (
                    <React.Fragment key={item.label}>
                      <div className="text-end min-w-[64px]">
                        {item.label}
                        {item.description && (
                          <Tooltip title={item.description}>
                            <InfoCircleOutlined className="ml-1" rotate={180} />
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {item.type === 'select' && item.label === '朗读声音' ? (
                          <AudioSelect onAudioChange={item.onChange} />
                        ) : (
                          <>
                            <Select onChange={item.onChange} style={{ minWidth: '138px' }} defaultValue={item.default} options={item.options.map((option) => ({ value: String(option.value), label: String(option.label) }))} />
                          </>
                        )}
                      </div>

                      {item.label === '背景音乐' && bgm_type === 'custom' && (
                        <>
                          <div className="text-end min-w-[64px]">自定义音乐路径</div>
                          <div className="flex gap-4">
                            <Upload
                              fileList={[]}
                              accept={'.mp3'}
                              customRequest={(options) => {
                                console.log(options)
                              }}
                            >
                              <Input
                                style={{
                                  width: 138
                                }}
                                className="cursor-pointer"
                                readOnly
                                placeholder="点击上传"
                              />
                            </Upload>
                          </div>
                        </>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
            <div className="item">
              <div className="w-[2px] h-[70px] bg-[#101215] hidden xl:block" />
            </div>
            {/* 字幕设置 */}
            <div>
              <span className="text-[#8C8B99]/[0.6]">字幕设置</span>
              <div className="mt-4 grid grid-rows-2 grid-cols-[auto_auto] justify-between items-center gap-4">
                {subtitleSettings.map((item) => {
                  return (
                    <React.Fragment key={item.label}>
                      <div className="text-end min-w-16">
                        {item.label}
                        {item.description && (
                          <Tooltip title={item.description}>
                            <InfoCircleOutlined className="ml-1" rotate={180} />
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {item.type instanceof Array &&
                          item.type.map((type, index) => {
                            if (type === 'checkbox') {
                              return <Checkbox key={index} onChange={(e) => item.onChange[0](e.target.checked as never)} checked={item.default[0] as boolean} />
                            } else if (type === 'select') {
                              return (
                                <Select
                                  key={index}
                                  // style={{
                                  //   minWidth: index === 0 ? '114px' : '75px'
                                  // }}
                                  className={`${index === 0 ? 'min-w-[114px] 2xl:min-w-[138px]' : 'min-w-[75px] 2xl:min-w-[90px]'}`}
                                  dropdownStyle={{
                                    minWidth: index === 0 ? '130px' : ''
                                  }}
                                  popupClassName="w-[138px] 2xl:w-[180px]"
                                  options={item.options && item.options[index] ? item.options[index].map((option) => ({ value: String(option.value), label: String(option.label) })) : []}
                                  onChange={(value) => item.onChange[index](value as never)}
                                  defaultValue={index === 1 ? item.default[index] + 'px' : item.default[index]}
                                />
                              )
                            } else if (type === 'ColorPicker') {
                              return <ColorPicker key={index} className={'min-w-[114px] 2xl:min-w-[138px] justify-start'} showText onChangeComplete={(color) => item.onChange[index](color as never)} defaultValue={item.default[index] as string} />
                            } else {
                              return null
                            }
                          })}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default VideoCreation
