//  知识库 Dify API
import { ChatPromptConfig, CompletionPromptConfig, ModelModeType } from '@/types/app'
import { get, IOnCompleted, IOnData, IOnError, IOnFile, IOnMessageEnd, IOnMessageReplace, IOnThought, post, ssePost } from '@/utils/request'
export type AutomaticRes = {
  prompt: string
  variables: string[]
  opening_statement: string
}
type sendChatMessageReq = {
  query: string
  inputs?: object
  response_mode?: 'streaming' | 'blocking'
  user: string
  conversation_id: string
  files?: Array<{
    type: 'image'
    transfer_method: 'remote_url' | 'local_file'
    url?: string
    upload_file_id: string
  }>
  auto_generate_name?: boolean
}
type Usage = {
  prompt_tokens: number
  prompt_unit_price: string
  prompt_price_unit: string
  prompt_price: string
  completion_tokens: number
  completion_unit_price: string
  completion_price_unit: string
  completion_price: string
  total_tokens: number
  total_price: string
  currency: string
  latency: number
}

type RetrieverResource = {
  position: number
  dataset_id: string
  dataset_name: string
  document_id: string
  document_name: string
  segment_id: string
  score: number
  content: string
}

//  blocking 模式
export type ChatCompletionResponse = {
  event: string
  message_id: string
  conversation_id: string
  mode: string
  answer: string
  metadata: {
    usage: Usage
    retriever_resources: Array<RetrieverResource>
  }
  created_at: number
}
type MessageEvent = {
  event: 'message'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

type AgentMessageEvent = {
  event: 'agent_message'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

type AgentThoughtEvent = {
  event: 'agent_thought'
  id: string
  task_id: string
  message_id: string
  position: number
  thought: string
  observation: string
  tool: string
  tool_input: string
  created_at: number
  message_files: Array<string>
  file_id: string
  conversation_id: string
}

type MessageFileEvent = {
  event: 'message_file'
  id: string
  type: string
  belongs_to: string
  url: string
  conversation_id: string
}

type MessageEndEvent = {
  event: 'message_end'
  task_id: string
  message_id: string
  conversation_id: string
  metadata: {
    usage: Usage
    retriever_resources: Array<RetrieverResource>
  }
}

type MessageReplaceEvent = {
  event: 'message_replace'
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

type ErrorEvent = {
  event: 'error'
  task_id: string
  message_id: string
  status: number
  code: string
  message: string
}

type PingEvent = {
  event: 'ping'
}

export type ChunkChatCompletionResponse = MessageEvent | AgentMessageEvent | AgentThoughtEvent | MessageFileEvent | MessageEndEvent | MessageReplaceEvent | ErrorEvent | PingEvent
export const sendChatMessage = async (
  body: sendChatMessageReq,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onError,
    getAbortController,
    onMessageEnd,
    onMessageReplace
  }: {
    onData: IOnData
    onCompleted: IOnCompleted
    onFile: IOnFile
    onThought: IOnThought
    onMessageEnd: IOnMessageEnd
    onMessageReplace: IOnMessageReplace
    onError: IOnError
    getAbortController?: (abortController: AbortController) => void
  }
) => {
  return ssePost(
    `/chat-messages`,
    {
      body: {
        ...body,
        response_mode: 'streaming'
      }
    },
    { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace }
  ) as void | Promise<ChunkChatCompletionResponse>
}

/**
 * Stops the chat message responding for a given task ID.
 *
 * @param {string} taskId - The ID of the task to stop responding for.
 * @return {Promise<any>} A promise that resolves when the task responding is stopped.
 */
export const stopChatMessageResponding = async (taskId: string) => {
  return post(`/chat-messages/${taskId}/stop`)
}

// 获取联想词
export const getMessagesSuggested = async (message_id: string, user: string) => {
  return get(`/messages/${message_id}/suggested?user=${user}`)
}
