//  openAi
import OpenAI from 'openai'
export const OPENAI_MODEL = 'gpt-3.5-turbo'
export const OPENAI_API_KEY = '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'
export const TEMPERATURE = 0.6
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true //允许在浏览器中调用
})

export default openai
