import { Button, Checkbox, ColorPicker, Input, Select, Tooltip, Upload } from 'antd'
import './index.css'
import { CSSProperties, useEffect, useRef, useState } from 'react'
import { InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import AudioSelect, { formatVioceName } from './components/AudioSelect'
import React from 'react'
import { BgmRetrieveResponse, createVideo, deleteVideoTask, generateVideoScript, generateVideoTerms, getTaskStatus, HTTPValidationError, TaskQueryData, TaskQueryResponse, TaskResponse, uploadBgmFile, uploadLocalFile } from '@/api/MoneyPrinterTurbo'
import { randomCopywriting, randomTheme, getFontName } from './constants'
import Toast from '@/components/Toast'
import { getTaskIds, hasTaskIds, removeTaskIds, saveTaskIds } from './untils'
import { useMount, useRequest, useUpdateEffect } from 'ahooks'
import Video from './components/VideoItem'
import { UploadRequestOption } from 'rc-upload/lib/interface'
import { RcFile } from 'antd/es/upload/interface'
// videoSettings audioSettings subtitleSettings

const VideoCreation: React.FC<{}> = () => {
  // 视频主题
  const [video_subject, setVideo_subject] = useState('')
  // 视频主题 textarea ref
  const video_subject_ref = useRef<HTMLTextAreaElement>(null)
  // 视频文案
  const [video_script, setVideo_script] = useState('')
  // 视频文案textarea ref
  const video_script_ref = useRef<HTMLTextAreaElement>(null)
  // 视频关键字
  const [video_terms, setVideo_terms] = useState<string>('')
  // 视频文案生成loading
  const [video_script_loading, setVideo_script_loading] = useState(false)
  // 设置是否展开
  const [expand, setExpand] = useState(false)
  // 画面比例
  const [video_aspect, setVideo_aspect] = useState<'16:9' | '9:16' | '1:1' | null>('16:9')
  // 视频来源
  const [video_source, setVideo_source] = useState('pexels')
  // 视频材料
  const [video_materials, setVideo_materials] = useState([
    {
      provider: 'pexels',
      url: '',
      duration: 0
    }
  ])
  // 视频拼接模式
  const [video_concat_mode, setVideo_concat_mode] = useState<'random' | 'sequential'>('random')
  // 视频片段最大时长(秒)（不是视频总长度，是指每个合成片段的长度）
  const [video_clip_duration, setVideo_clip_durationn] = useState<2 | 3 | 4 | 5 | 6>(5)
  // 同时生成视频数量
  const [video_count, setVideo_count] = useState<1 | 2 | 3 | 4 | 5>(1)
  // 朗读音频名称
  const [voice_name, setVoice_name] = useState('CN-晓晓-女')
  //音频音量
  const [voice_volume, setVoice_volume] = useState(1.0)
  // 背景音乐 random 随机  custom 自定义 none 无
  const [bgm_type, setBgm_type] = useState('random')
  // 自定义的bgm的文件
  const [bgm_file, setBgm_file] = useState('')
  // 音乐文件list
  const [bgm_list, setBgm_list] = useState<BgmRetrieveResponse[]>([])
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
  // 处于历史记录 还是在创建
  const [inHistory, setInHistory] = useState(false)
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
  const [taskIds, setTaskIds] = useState<string[]>(getTaskIds() || [])
  // video历史记录
  const [videoHistoryList, setVideoHistoryList] = useState<
    {
      task_id: string
      data: TaskQueryData
    }[]
  >()

  const { run: runTaskStatus, cancel: cancelTaskStatus } = useRequest(
    (ids: string[]) => {
      const tasks = ids.map((id) => getTaskStatus(id))
      return Promise.all(tasks)
    },
    {
      manual: true,
      pollingInterval: 10000,
      pollingWhenHidden: false,
      onSuccess: (result, [ids]) => {
        console.log(result, ids, 'result')
        let newVideoHistoryList = videoHistoryList ? [...videoHistoryList] : []
        ids.forEach((taskId, index) => {
          const existingItemIndex = newVideoHistoryList.findIndex((item) => item.task_id === taskId)
          const newItem = {
            task_id: taskId,
            data: result[index].data
          }
          if (existingItemIndex > -1) {
            newVideoHistoryList[existingItemIndex] = newItem
          } else {
            newVideoHistoryList.push(newItem)
          }
        })
        setVideoHistoryList(newVideoHistoryList)

        // 检查每个任务的状态，如果任务已经完成（假设进度为100%表示完成），则从轮询列表中移除
        const newTaskIds = ids.filter((taskId, index) => {
          const taskData = result[index].data
          if (taskData) {
            return taskData.progress < 100 && !(taskData.progress === 0 && taskData.state === -1)
          }
          return false
        })
        if (newTaskIds.length > 0) {
          console.log('正在轮询任务', newTaskIds)
          setTaskIds(newTaskIds)
        } else {
          cancelTaskStatus()
        }
      }
    }
  )

  useUpdateEffect(() => {
    if (taskIds.length > 0) {
      runTaskStatus(taskIds)
    } else {
      cancelTaskStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIds.length])

  useMount(() => {
    setTaskIds(getTaskIds() || [])
    runTaskStatus(getTaskIds() || [])
  })
  const onSubmit = async () => {
    // 打印所有参数 整个成一个对象
    const params = {
      video_subject,
      video_script,
      video_aspect,
      video_source,
      video_materials,
      video_concat_mode,
      video_clip_duration,
      video_count,
      video_terms,
      voice_name: formatVioceName[voice_name],
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
    }
    console.log(params)
    try {
      const res = await createVideo(params)
      if (res && res.status === 200) {
        setVideo_subject('')
        setVideo_script('')
        // 将task_id保存到localStorage
        saveTaskIds([res.data.task_id])
        setTaskIds(taskIds.length > 0 ? [...taskIds, res.data.task_id] : [res.data.task_id])
        runTaskStatus([res.data.task_id])
        setInHistory(!inHistory)
      }
    } catch (error) {
      Toast.notify({ type: 'error', message: '创建失败' })
    }
  }
  // 删除视频
  const handleDeleteVideo = async (taskId: string) => {
    console.log(taskId)
    const res = await deleteVideoTask(taskId)
    if (res.status === 200) {
      Toast.notify({ type: 'success', message: '删除成功' })
      setVideoHistoryList((perv) => {
        return perv ? perv.filter((item) => item.task_id !== taskId) : undefined
      })
      // 从本地缓存中 过滤掉当前id
      localStorage.setItem('task_id', JSON.stringify(getTaskIds()!.filter((id) => id !== taskId)))
    }
  }
  // 根据视频主题 生成文案
  const generateCopywriting = async () => {
    if (!video_subject) {
      return Toast.notify({
        type: 'warning',
        message: '请输入视频主题'
      })
    }
    setVideo_script_loading(true)
    try {
      const res = await generateVideoScript({
        video_subject
      })
      if (res.status === 200) {
        const data = await generateVideoTerms({
          video_script: res.data.video_script,
          video_subject,
          amount: 10
        })
        if (data.status === 200) {
          setVideo_subject('')
          setVideo_script(res.data.video_script)
          video_script_ref.current?.focus()
          setVideo_terms(data.data.video_terms.join(','))
          setVideo_script_loading(false)
        }
      }
    } catch (error) {
      setVideo_script_loading(false)
      Toast.notify({ type: 'error', message: '生成失败' })
    }
    setVideo_script_loading(false)
  }
  // 自定义上传bgm
  const customUploadBgmFile = async ({ file }: UploadRequestOption) => {
    const f = file as RcFile
    // 判断文件格式 如果不为mp3 直接返回
    console.log(f)
    if (!f.name.endsWith('.mp3')) {
      return Toast.notify({
        type: 'warning',
        message: '只支持上传mp3格式音乐'
      })
    }
    const formData = new FormData()
    formData.append('file', f)
    const res = await uploadBgmFile(formData)
    if (res.status === 200) {
      setBgm_file(res.data.file)
      Toast.notify({
        type: 'success',
        message: '上传成功'
      })
    } else {
      Toast.notify({
        type: 'warning',
        message: res.message as string
      })
    }
  }
  // 自定义上传本地文件
  const customUploadLocalFile = async ({ file }: UploadRequestOption) => {
    const f = file as RcFile
    // .mp4,.mov,.avi,.flv,.mkv,.jpg,.jpeg,.png,.mpeg4
    // 判断文件格式统一 校验格式
    const accept = ['.mp4', '.mov', '.avi', '.flv', '.mkv', '.jpg', '.jpeg', '.png', '.mpeg4']
    if (!accept.includes(f.name.slice(f.name.lastIndexOf('.')))) {
      return Toast.notify({
        type: 'warning',
        message: '支持上传mp4、mov、avi、flv、mkv、jpg、jpeg、png、mpeg4格式文件'
      })
    }
    const formData = new FormData()
    formData.append('file', f)
    // const res = await uploadLocalFile(formData)
    // if (res.status === 200) {
    //   setVideo_materials(res.data.file)
    //   Toast.notify({
    //     type: 'success',
    //     message: '上传成功'
    //   })
    // } else {
    //   Toast.notify({
    //     type: 'warning',
    //     message: res.message as string
    //   })
    // }
  }
  // 视频设置
  const videoSettings = [
    {
      label: '画面比例',
      options: [
        { value: '16:9', label: '16:9', disabled: false },
        { value: '9:16', label: '9:16', disabled: false }
      ],
      type: 'box',
      onChange: (value: string | number) => setVideo_aspect(value as '16:9' | '9:16' | '1:1' | null),
      default: video_aspect,
      description: ''
    },
    {
      label: '视频来源',
      options: [
        { value: 'pexels', label: 'Pexels', disabled: false },
        { value: 'pixabay', label: 'Pixabay', disabled: false },
        { value: 'local', label: '本地文件', disabled: true },
        { value: 'douyin', label: '抖音(支持中,敬请期待)', disabled: true },
        { value: 'bilibili', label: '哔哩哔哩(支持中,敬请期待)', disabled: true },
        { value: 'smallRedBook', label: '小红书(支持中,敬请期待)', disabled: true }
      ],
      type: 'select',
      onChange: (value: string | number) => {
        setVideo_source(value as string)
        setVideo_materials([
          {
            provider: value as string,
            url: '',
            duration: 0
          }
        ])
      },
      default: video_source,
      description: ''
    },
    {
      label: '拼接模式',
      options: [
        { value: 'random', label: '随机拼接（推荐）', disabled: false },
        { value: 'sequential', label: '顺序拼接', disabled: false }
      ],
      type: 'select',
      onChange: (value: string | number) => setVideo_concat_mode(value as 'random' | 'sequential'),
      default: video_concat_mode,
      description: '视频拼接模式'
    },
    {
      label: '片段时长',
      options: Array.from({ length: 5 }, (_, i) => i + 2).map((value) => ({ value, label: value, disabled: false })),
      type: 'select',
      onChange: (value: string | number) => setVideo_clip_durationn(Number(value) as 2 | 3 | 4 | 5 | 6),
      default: video_clip_duration,
      description: '视频片段最大时长(秒)不是视频总长度，是指每个合成片段的长度'
    },
    {
      label: '生成数量',
      options: Array.from({ length: 5 }, (_, i) => i + 1).map((value) => ({ value, label: value, disabled: false })),
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
      <div className="ml-1 ">
        <p>基于强大的类似Sora AI模型，任意文本、图片都能快速生成高质量视频。无论是新手小白，还是对视频有高标准严要求的专业人士，GotoAI视频生成器都能轻松满足您的需求，让每一个想法都大放异彩，适用于抖音，快手，西瓜视频，今日头条视频。</p>
      </div>
      <div className="flex flex-col flex-1  w-full rounded-[20px] p-[16px] lg:p-[20px] relative">
        <div className="flex flex-col">
          <div
            className="flex gap-[16px]"
            style={{
              justifyContent: !inHistory ? 'space-between' : 'flex-end'
            }}
          >
            <div
              style={{
                display: inHistory ? 'none' : ''
              }}
            >
              <div className="dropdown">
                <Button type="primary" onClick={() => video_subject_ref.current?.focus()} tabIndex={0} role="button" className="bg-[#1677ff] h-10" icon={<i className="iconfont icon-mobang"></i>} shape="round">
                  AI帮我写
                </Button>
                <div tabIndex={0} className="dropdown-content mt-[10px] z-[1000] menu p-2 shadow bg-base-100 rounded-box w-[500px]">
                  <Input.TextArea ref={video_subject_ref} value={video_subject} onChange={(e) => setVideo_subject(e.target.value)} variant="borderless" className="" autoSize={{ minRows: 3 }} placeholder="输入视频主题，一键生成视频文案" />
                  <div className="flex flex-row items-center justify-between w-full h-[40px] px-[6px] pb-6px">
                    <Button onClick={randomThemeClick} type="default" icon={<i className="iconfont icon-suijibofang"></i>} shape="round">
                      随机主题
                    </Button>
                    <Button loading={video_script_loading} onClick={generateCopywriting} disabled={!video_subject} type="primary" tabIndex={0} role="button" className="bg-[#1677ff] h-10" icon={<i className="iconfont icon-mobang"></i>} shape="round">
                      生成
                    </Button>
                  </div>
                </div>
              </div>

              <Button type="primary" onClick={randomCopywritingClick} className="bg-[#1677ff] ml-2 h-10" icon={<i className="iconfont icon-suijibofang"></i>} shape="round">
                示例
              </Button>
            </div>
            <div className="h-[32px] lg:h-[40px] ">
              <div
                style={{
                  display: inHistory ? 'flex' : 'none'
                }}
                className="transition duration-500 hover:translate-y-[5px] will-change-transform w-fit lg:w-[200px] h-full text-[14px] lg:text-[16px] relative"
              >
                {videoHistoryList && videoHistoryList.length > 0 && (
                  <Button onClick={() => setInHistory(!inHistory)} type="primary" className="bg-[#1677ff] w-[180px] h-10" shape="round">
                    生成新视频
                  </Button>
                )}
              </div>
              <span
                className="flex flex-col justify-end items-center cursor-pointer text-#fff opacity-50 underline h-full underline-offset-2"
                style={{
                  display: !inHistory ? 'flex' : 'none'
                }}
                onClick={() => setInHistory(!inHistory)}
              >
                生成记录
              </span>
            </div>
          </div>
          {/* detail */}
          <div
            style={{
              display: inHistory ? 'none' : ''
            }}
          >
            <div className="mt-4 relative ">
              <Input.TextArea ref={video_script_ref} value={video_script} onChange={(e) => setVideo_script(e.target.value)} showCount maxLength={5000} className="rounded-[20px]  video_textarea !px-3 !pt-3 !pb-8" autoSize={{ minRows: 8 }} placeholder="输入视频文案 或 使用AI帮写服务自动生成文案" />
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
                          {item.type === 'select' && <Select onChange={item.onChange} style={{ width: '100%' }} defaultValue={item.default} options={item.options.map((option) => ({ value: String(option.value), label: String(option.label), disabled: option.disabled }))} />}
                        </div>
                        {item.label === '视频来源' && video_source === 'local' && (
                          <>
                            <div className="text-end min-w-[64px]">
                              本地文件
                              <Tooltip title={'支持mp4、mov、avi、flv、mkv、jpg、jpeg、png、mpeg4'}>
                                <InfoCircleOutlined className="ml-1" rotate={180} />
                              </Tooltip>
                            </div>
                            <div className="flex gap-4">
                              <Upload fileList={[]} accept=".mp4,.mov,.avi,.flv,.mkv,.jpg,.jpeg,.png,.mpeg4" customRequest={customUploadLocalFile}>
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
                              <Upload fileList={[]} accept={'.mp3'} customRequest={customUploadBgmFile}>
                                <Input
                                  style={{
                                    width: 138
                                  }}
                                  className="cursor-pointer"
                                  value={bgm_file.split('/').pop()}
                                  readOnly
                                  placeholder="点击上传"
                                  suffix={
                                    <CloseCircleOutlined
                                      style={{ display: bgm_file ? '' : 'none' }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setBgm_file('')
                                      }}
                                    />
                                  }
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
                                return (
                                  <ColorPicker
                                    key={index}
                                    className={'min-w-[114px] 2xl:min-w-[138px] justify-start'}
                                    showText
                                    onChangeComplete={(color) => {
                                      item.onChange[index](color.toHexString() as never)
                                    }}
                                    defaultValue={item.default[index] as string}
                                  />
                                )
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
          {/* 历史记录 */}
          <div
            className="flex flex-col h-full"
            style={{
              display: inHistory ? 'flex' : 'none'
            }}
          >
            <div className="flex gap-[4px] items-center">
              <span className="text-[16px] leading-[20px] font-semibold">生成记录</span>
              {videoHistoryList && <span className="flex items-center h-[18px] text-[14px] font-semibold text-primary-color px-[10px] rounded-[30px] bg-primary-color/[0.2]">{videoHistoryList.length > 0 ? videoHistoryList.length : ''}</span>}
            </div>
            <div className="mt-[30px] flex-1">
              {videoHistoryList && videoHistoryList.length > 0 && (
                <ul className="grid grid-cols-1 lg:grid-cols-4 gap-[32px] overflow-auto nw-no-scroll h-[calc(100vh-220px)] lg:h-[calc(100vh-200px-70px)]">
                  {videoHistoryList.map((item, index) => {
                    return (
                      <li key={index}>
                        <div>
                          <div className="relative ">
                            {item.data &&
                              item.data.progress === 100 &&
                              item.data.videos.map((video) => {
                                return <Video url={video} key={video} onDelete={() => handleDeleteVideo(item.task_id)} />
                              })}
                            {item.data && item.data.state === -1 && item.data.progress === 0 && (
                              <div>
                                <img alt="placeholder" className="w-full aspect-video bg-#54545A26/[0.1] rounded-[16px]" src="https://qncdn.aoscdn.com/astro/reccloud/_astro/cover.0583e4e6.svg" />
                                <div className="absolute inset-0 flex flex-col justify-center items-center gap-[12px] cursor-pointer bg-black/[0.5] rounded-[16px]">
                                  <span className="text-[18px] text-[#F06464] font-semibold">生成失败</span>
                                  <div className="flex gap-[8px] items-center justify-center group">
                                    <span className="text-[16px] font-bold text-white group-hover:text-[#bbb]">
                                      <i className="iconfont icon-zhongshi mr-2"></i>
                                      重试
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {item.data && item.data.state !== -1 && item.data.progress !== 100 && (
                              <div>
                                <img alt="placeholder" className="w-full aspect-video bg-#54545A26/[0.1] rounded-[16px]" src="https://qncdn.aoscdn.com/astro/reccloud/_astro/cover.0583e4e6.svg" />
                                <div className="absolute inset-0 flex flex-col justify-center items-center gap-[12px] cursor-pointer bg-black/[0.5] rounded-[16px]">
                                  <div className="radial-progress" style={{ '--value': item.data.progress } as CSSProperties} role="progressbar">
                                    {item.data.progress}%
                                  </div>
                                  生成中......
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              <div
                style={{
                  display: !videoHistoryList ? 'flex' : videoHistoryList.length === 0 ? 'flex' : 'none'
                }}
                className="w-full h-[60vh] flex justify-center items-center flex-col gap-[16px]"
              >
                <span>您目前没有任何生成的视频。</span>
                <div className="transition duration-500 hover:translate-y-[5px] will-change-transform min-w-[200px] h-[40px] w-fit">
                  <div className="w-full h-full  relative transition flex justify-center items-center font-medium cursor-pointer rounded-[60px] border-none hover:shadow-none">
                    <Button onClick={() => setInHistory(!inHistory)} type="primary" className="bg-[#1677ff] w-[180px] h-10" shape="round">
                      生成新视频
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default VideoCreation
