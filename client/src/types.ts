export const boardStatuses = ["PUBLIC", "PRIVATE"] as const

export type BoardStatus = (typeof boardStatuses)[number]

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
