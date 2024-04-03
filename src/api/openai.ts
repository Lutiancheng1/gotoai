import Toast from '@/components/Toast'
import { parsePack } from '@/utils/format'
import { OPENAI_API_KEY, TEMPERATURE } from '@/utils/openAi'
import { tryit } from 'radash'
export interface messages {
  role: 'system' | 'user' | 'assistant'
  content: string
}
/**
 * onStart: 调用函数后请求发出前
 * onCreated: 发出请求收到第一个回包后执行
 * onPatch: 有新的内容更新时执行
 * onDone: 传输结束时执行
 */

export class StreamGpt {
  onStart: (prompt: messages[]) => void
  onCreated: () => void
  onDone: (resultText: string) => void
  onPatch: (text: string, reduceText: string) => void
  constructor(
    // private key: string,
    options: {
      onStart: (prompt: messages[]) => void
      onCreated: () => void
      onDone: (resultText: string) => void
      onPatch: (text: string, reduceText: string) => void
    }
  ) {
    const { onStart, onCreated, onDone, onPatch } = options

    this.onStart = onStart
    this.onCreated = onCreated
    this.onPatch = onPatch
    this.onDone = onDone
  }
  async stream(prompt: messages[], history: messages[] = []) {
    let finish = false
    let count = 0
    let resultText = ''
    // 触发onStart
    this.onStart(prompt)
    // 发起请求

    const [err, res] = await tryit(sendMessageStreamToAi)([...history, ...prompt])
    // 国内ip无法请求 openai
    if (err) return this.onDone(err.message)
    // 429 请求频繁
    if (res.status === 429) {
      return this.onDone('请求频繁，请稍后再试')
    }
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
        this.onDone(resultText)
        break
      }
      count++
      const jsonArray = parsePack(decoder.decode(value))
      if (count === 1) {
        this.onCreated()
      }
      // eslint-disable-next-line no-loop-func
      jsonArray.forEach((json: any) => {
        if (!json.choices || json.choices.length === 0) {
          return
        }
        const text = json.choices[0].delta.content
        if (text) {
          resultText = resultText + text
          this.onPatch(text, resultText)
        }
      })
    }
  }
}

/**
 * Sends a stream of messages to the OpenAI API for chat completion.
 *
 * @param {Array<messages>} messages - An array of messages to be sent to the API.
 * @return {Promise<Response>} - A promise that resolves to the response from the API.
 */
export const sendMessageStreamToAi = async (messages: Array<messages>) => {
  return await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // gpt-4, gpt-4-0314, gpt-4-32k, gpt-4-32k-0314, gpt-3.5-turbo, gpt-3.5-turbo-0301
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
