//  知识库 Dify API
import { ChatPromptConfig, CompletionPromptConfig, ModelModeType } from '@/types/app'
import { get, IOnCompleted, IOnData, IOnError, IOnFile, IOnMessageEnd, IOnMessageReplace, IOnThought, post, ssePost } from '@/utils/request'
export type AutomaticRes = {
  prompt: string
  variables: string[]
  opening_statement: string
}

export const sendChatMessage = async (
  body: Record<string, any>,
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
  },
  appId: string
) => {
  return ssePost(
    `apps/chat-messages`,
    {
      body: {
        ...body,
        response_mode: 'streaming'
      }
    },
    { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace }
  )
}

export const stopChatMessageResponding = async (appId: string, taskId: string) => {
  return post(`apps/${appId}/chat-messages/${taskId}/stop`)
}

export const sendCompletionMessage = async (
  appId: string,
  body: Record<string, any>,
  {
    onData,
    onCompleted,
    onError,
    onMessageReplace
  }: {
    onData: IOnData
    onCompleted: IOnCompleted
    onError: IOnError
    onMessageReplace: IOnMessageReplace
  }
) => {
  return ssePost(
    `apps/${appId}/completion-messages`,
    {
      body: {
        ...body,
        response_mode: 'streaming'
      }
    },
    { onData, onCompleted, onError, onMessageReplace }
  )
}

export const fetchSuggestedQuestions = (appId: string, messageId: string, getAbortController?: any) => {
  return get(
    `apps/${appId}/chat-messages/${messageId}/suggested-questions`,
    {},
    {
      getAbortController
    }
  )
}

export const fetchConvesationMessages = (appId: string, conversation_id: string, getAbortController?: any) => {
  return get(
    `apps/${appId}/chat-messages`,
    {
      params: {
        conversation_id
      }
    },
    {
      getAbortController
    }
  )
}

export const generateRule = (body: Record<string, any>) => {
  return post<AutomaticRes>('/rule-generate', {
    body
  })
}

export const fetchPromptTemplate = ({ appMode, mode, modelName, hasSetDataSet }: { appMode: string; mode: ModelModeType; modelName: string; hasSetDataSet: boolean }) => {
  return get<Promise<{ chat_prompt_config: ChatPromptConfig; completion_prompt_config: CompletionPromptConfig; stop: [] }>>('/app/prompt-templates', {
    params: {
      app_mode: appMode,
      model_mode: mode,
      model_name: modelName,
      has_context: hasSetDataSet
    }
  })
}

export const fetchTextGenerationMessge = ({ appId, messageId }: { appId: string; messageId: string }) => {
  return get<Promise<{ message: [] }>>(`/apps/${appId}/messages/${messageId}`)
}
