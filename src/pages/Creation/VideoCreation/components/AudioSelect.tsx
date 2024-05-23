import { Select, Button, Menu } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Option } = Select

interface AudioFile {
  name: string
  url: string
}

interface AudioSelectProps {
  onAudioChange?: (audioName: string) => void
}
export const formatVioceName = {
  'CN-晓晓-女': 'zh-CN-XiaoxiaoNeural-Female',
  'CN-晓晓v2-女': 'zh-CN-XiaoxiaoMultilingualNeural-V2-Female',
  'HK-HiuGaai-女': 'zh-HK-HiuGaaiNeural-Female',
  'HK-HiuMaan-女': 'zh-HK-HiuMaanNeural-Female',
  'HK-WanLung-男': 'zh-HK-WanLungNeural-Male',
  'TW-HsiaoChen-女': 'zh-TW-HsiaoChenNeural-Female',
  'TW-HsiaoYu-女': 'zh-TW-HsiaoYuNeural-Female',
  'TW-YunJhe-男': 'zh-TW-YunJheNeural-Male',
  'US-Aria-女': 'en-US-AriaNeural-Female',
  'US-Ava-女': 'en-US-AvaNeural-Female',
  'US-安娜-女': 'en-US-AnaNeural-Female',
  'US-安德鲁-男': 'en-US-AndrewNeural-Male',
  'US-安德鲁v2-男': 'en-US-AndrewMultilingualNeural-V2-Male',
  'US-詹妮-女': 'en-US-JennyNeural-Female',
  'CN-云夏-男': 'zh-CN-YunxiaNeural-Male',
  'CN-云溪-男': 'zh-CN-YunxiNeural-Male',
  'CN-云间-男': 'zh-CN-YunjianNeural-Male',
  'CN-云阳-男': 'zh-CN-YunyangNeural-Male',
  'CN-小艺-女': 'zh-CN-XiaoyiNeural-Female'
} as {
  [key: string]: string
}
declare var require: {
  context: (
    path: string,
    deep?: boolean,
    filter?: RegExp
  ) => {
    keys: () => string[]
    (id: string): any
  }
}

const audioContext = require.context('./audio', false, /\.mp3$/)

const audioFiles: AudioFile[] = audioContext.keys().map((filename: string) => {
  return {
    name: filename.substr(2).replace('.mp3', ''),
    url: audioContext(filename)
  }
})

function AudioSelect({ onAudioChange }: AudioSelectProps) {
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null)
  const [playingAudioName, setPlayingAudioName] = useState<string | null>()
  const [selectedAudioName, setSelectedAudioName] = useState<string | null>('CN-晓晓-女')

  function playAudio(name: string, url: string) {
    if (playingAudio) {
      playingAudio.pause()
    }

    const audio = new Audio(url)
    audio.play()
    audio.onended = () => {
      setPlayingAudio(null)
      setPlayingAudioName(null)
    }
    setPlayingAudio(audio)
    setPlayingAudioName(name)
  }

  function pauseAudio() {
    if (playingAudio) {
      playingAudio.pause()
      setPlayingAudio(null)
      setPlayingAudioName(null)
    }
  }

  function handleAudioChange(audioName: string) {
    setSelectedAudioName(audioName)
    if (onAudioChange) {
      onAudioChange(audioName)
    }
  }
  return (
    <Select
      style={{ width: '100%' }}
      value={selectedAudioName}
      onChange={handleAudioChange}
      optionRender={(option) => {
        const audio = audioFiles.find((audio) => audio.name === option.value)
        if (!audio) return null
        return (
          <div className="flex justify-between" key={option.key}>
            <span className="text-12">{audio.name}</span>
            {playingAudioName === audio.name ? (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  pauseAudio()
                }}
              >
                <PauseCircleOutlined />
              </span>
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(audio.name, audio.url)
                }}
              >
                <PlayCircleOutlined />
              </span>
            )}
          </div>
        )
      }}
    >
      {audioFiles.map((audio, index) => (
        <Option key={index} value={audio.name}>
          {audio.name}
        </Option>
      ))}
    </Select>
  )
}

export default AudioSelect
