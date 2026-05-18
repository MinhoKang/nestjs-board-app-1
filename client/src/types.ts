export const boardStatuses = ["PUBLIC", "PRIVATE"] as const
export const authFlows = ["combined", "separated"] as const
export const authMethods = ["plain", "hash", "hash-newline"] as const

export type BoardStatus = (typeof boardStatuses)[number]
export type AuthFlow = (typeof authFlows)[number]
export type AuthMethod = (typeof authMethods)[number]

export type Board = {
  id: number
  title: string
  content: string
  status: BoardStatus
  createdAt: string
  user?: {
    id: number
    username: string
    nickname?: string
  }
}

export type Comment = {
  id: number
  content: string
  createdAt: string
  user: {
    id: number
    username: string
  }
}

export type AccessTokenResponse = {
  accessToken: string
}
