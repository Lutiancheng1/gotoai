import React from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  return <ReactPlayer url={url} controls={true} playing={true} />
}

export default VideoPlayer
