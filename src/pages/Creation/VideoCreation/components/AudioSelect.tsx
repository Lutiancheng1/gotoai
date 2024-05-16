import { Select, Button } from 'antd'
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
  const [playingAudioName, setPlayingAudioName] = useState<string | null>(null)
  const [selectedAudioName, setSelectedAudioName] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
      dropdownStyle={{
        width: 170
      }}
      value={selectedAudioName}
      onChange={handleAudioChange}
      onDropdownVisibleChange={setIsDropdownOpen}
    >
      {audioFiles.map((audio, index) => (
        <Option key={index} value={audio.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {audio.name}
            {isDropdownOpen &&
              audio.name !== selectedAudioName &&
              (playingAudioName === audio.name ? (
                <Button
                  type="text"
                  icon={<PauseCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    pauseAudio()
                  }}
                />
              ) : (
                <Button
                  type="text"
                  icon={<PlayCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    playAudio(audio.name, audio.url)
                  }}
                />
              ))}
          </div>
        </Option>
      ))}
    </Select>
  )
}

export default AudioSelect
