import { parsePack } from '@/utils/format'
import { OPENAI_API_KEY, TEMPERATURE } from '@/utils/openAi'
export interface messages {
  role: 'system' | 'user' | 'assistant'
  content: string
}
export interface GptMsg {
  role: string
  content: string
}

export class StreamGpt {
  onStart: (prompt: string) => void
  onCreated: () => void
  onDone: () => void
  onPatch: (text: string) => void
  constructor(
    private key: string,
    options: {
      onStart: (prompt: string) => void
      onCreated: () => void
      onDone: () => void
      onPatch: (text: string) => void
    }
  ) {
    const { onStart, onCreated, onDone, onPatch } = options
    this.onStart = onStart
    this.onCreated = onCreated
    this.onPatch = onPatch
    this.onDone = onDone
  }
  async stream(prompt: string) {
    let finish = false
    let count = 0
    // 触发onStart
    this.onStart(prompt)
    // 发起请求
    const res = await sendMessageToAi([{ role: 'user', content: prompt }])
    if (!res.body) return
    // 从response中获取reader
    const reader = res.body.getReader()
    const decoder: TextDecoder = new TextDecoder()
    // 循环读取内容
    while (!finish) {
      const { done, value } = await reader.read()
      // console.log(value)
      if (done) {
        finish = true
        this.onDone()
        break
      }
      count++
      const jsonArray = parsePack(decoder.decode(value))
      if (count === 1) {
        this.onCreated()
      }
      jsonArray.forEach((json: any) => {
        if (!json.choices || json.choices.length === 0) {
          return
        }
        const text = json.choices[0].delta.content
        this.onPatch(text)
      })
    }
  }
}

export const sendMessageToAi = async (messages: Array<messages>) => {
  return await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [...messages],
      stream: true,
      temperature: TEMPERATURE
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    }
  })
}
