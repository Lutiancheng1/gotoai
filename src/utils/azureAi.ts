//  Azure openAi
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

export const AZURE_OPENAI_MODEL = 'gpt-4-1106-preview' // gpt-35-turbo-1106、gpt-4-1106-preview、gpt-4-vision-preview、text-embedding-ada-002、Dalle3
export const AZURE_OPENAI_API_KEY = '7f7b8998d32c4ed5bb023153fe9520c9'
const azureAi = new OpenAIClient('https://ai-gpt02.openai.azure.com/', new AzureKeyCredential(AZURE_OPENAI_API_KEY))

export default azureAi
