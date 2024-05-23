export interface AccountInfo {
  username: string
  password: string
}
export type ShartChatResp = {
  conversationId: string
  chatId: number
}
export const ALLOW_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif']
export enum TransferMethod {
  all = 'all',
  local_file = 'local_file',
  remote_url = 'remote_url'
}

export enum Resolution {
  low = 'low',
  high = 'high'
}
export type VisionSettings = {
  enabled: boolean
  number_limits: number
  detail: Resolution
  transfer_methods: TransferMethod[]
  image_file_size_limit?: number | string
}
export type ImageFile = {
  type: TransferMethod
  _id: string
  fileId: string
  file?: File
  progress: number
  url: string
  base64Url?: string
  deleted?: boolean
}
export type ThoughtItem = {
  id: string
  tool: string // plugin or dataset. May has multi.
  thought: string
  tool_input: string
  message_id: string
  observation: string
  position: number
  files?: string[]
  message_files?: VisionFile[]
}
export type VisionFile = {
  id?: string
  type: string
  transfer_method: TransferMethod
  url: string
  upload_file_id: string
  belongs_to?: string
}
export type CitationItem = {
  content: string
  data_source_type: string
  dataset_name: string
  dataset_id: string
  document_id: string
  document_name: string
  hit_count: number
  index_node_hash: string
  segment_id: string
  segment_position: number
  score: number
  word_count: number
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
export type MessageEnd = {
  id: string
  conversation_id: string
  created_at: number
  message_id: string
  task_id: string
  event: string
  metadata: {
    usage: Usage
  }
}

export type MessageReplace = {
  task_id: string
  message_id: string
  conversation_id: string
  answer: string
  created_at: number
}

export type AnnotationReply = {
  id: string
  task_id: string
  answer: string
  conversation_id: string
  annotation_id: string
  annotation_author_name: string
}

export enum PromptMode {
  simple = 'simple',
  advanced = 'advanced'
}

export type PromptItem = {
  role?: PromptRole
  text: string
}

export type ChatPromptConfig = {
  prompt: PromptItem[]
}

export type ConversationHistoriesRole = {
  user_prefix: string
  assistant_prefix: string
}
export type CompletionPromptConfig = {
  prompt: PromptItem
  conversation_histories_role: ConversationHistoriesRole
}

export type BlockStatus = {
  context: boolean
  history: boolean
  query: boolean
}

export enum PromptRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant'
}
export enum ModelModeType {
  'chat' = 'chat',
  'completion' = 'completion',
  'unset' = ''
}
export type MessageMore = {
  time: string
  tokens: number
  latency: number | string
}
export const MessageRatings = ['like', 'dislike', null] as const
export type MessageRating = (typeof MessageRatings)[number]
export type Feedbacktype = {
  rating: MessageRating
  content?: string | null
}

export type FeedbackFunc = (messageId: string, feedback: Feedbacktype) => Promise<any>
export type SubmitAnnotationFunc = (messageId: string, content: string) => Promise<any>

export type DisplayScene = 'web' | 'console'

export type ToolInfoInThought = {
  name: string
  input: string
  output: string
  isFinished: boolean
}

export type IChatItem = {
  id: string
  content: string
  citation?: CitationItem[]
  /**
   * Specific message type
   */
  isAnswer: boolean
  /**
   * The user feedback result of this message
   */
  feedback?: Feedbacktype
  /**
   * The admin feedback result of this message
   */
  adminFeedback?: Feedbacktype
  /**
   * Whether to hide the feedback area
   */
  feedbackDisabled?: boolean
  /**
   * More information about this message
   */
  more?: MessageMore
  annotation?: Annotation
  useCurrentUserAvatar?: boolean
  isOpeningStatement?: boolean
  suggestedQuestions?: string[]
  log?: { role: string; text: string; files?: VisionFile[] }[]
  agent_thoughts?: ThoughtItem[]
  message_files?: VisionFile[]
  workflow_run_id?: string
}
export type LogAnnotation = {
  content: string
  account: {
    id: string
    name: string
    email: string
  }
  created_at: number
}

export type Annotation = {
  id: string
  authorName: string
  logAnnotation?: LogAnnotation
  created_at?: number
}
