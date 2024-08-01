import React, { useState, useEffect } from 'react'

interface TxtPreviewProps {
  url: string
}

const TxtPreview: React.FC<TxtPreviewProps> = ({ url }) => {
  const [textContent, setTextContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTextFile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const text = await response.text()
        setTextContent(text)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTextFile()
  }, [url])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{textContent}</pre>
    </div>
  )
}

export default TxtPreview
