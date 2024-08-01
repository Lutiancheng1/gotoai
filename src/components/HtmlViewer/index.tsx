import React, { useState, useEffect } from 'react'

interface HtmlCodePreviewProps {
  url: string
}

const HtmlCodePreview: React.FC<HtmlCodePreviewProps> = ({ url }) => {
  const [htmlCode, setHtmlCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHtmlFile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const html = await response.text()
        setHtmlCode(html)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHtmlFile()
  }, [url])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  // Display HTML code as text within a <pre> tag
  return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{htmlCode}</pre>
}

export default HtmlCodePreview
