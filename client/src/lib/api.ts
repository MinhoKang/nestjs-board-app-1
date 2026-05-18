import axios, { AxiosHeaders } from "axios"

import type { AccessTokenResponse, Board, Comment } from "@/types"
import type {
  BoardFormValues,
  CommentFormValues,
  DeleteAccountFormValues,
  SignInFormValues,
  SignUpFormValues,
} from "@/lib/schemas"

const tokenStorageKey = "nestjs-board-access-token"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
})

export function getStoredToken() {
  return window.localStorage.getItem(tokenStorageKey)
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(tokenStorageKey, token)
}

export function clearStoredToken() {
  window.localStorage.removeItem(tokenStorageKey)
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers = AxiosHeaders.from(config.headers)
    config.headers.set("Authorization", `Bearer ${token}`)
  }

  return config
})

export async function signUp(payload: SignUpFormValues) {
  const { authFlow, authMethod, ...credentials } = payload

  await apiClient.post<void>(
    `/auth/signup/${authFlow}/${authMethod}`,
    credentials
  )
}

export async function signIn(payload: SignInFormValues) {
  const { authFlow, authMethod, ...credentials } = payload
  const response = await apiClient.post<AccessTokenResponse>(
    `/auth/signin/${authFlow}/${authMethod}`,
    credentials
  )

  return response.data
}

export async function deleteAccount(payload: DeleteAccountFormValues) {
  await apiClient.delete<void>("/auth/delete", {
    data: payload,
  })
}

export async function getBoards() {
  const response = await apiClient.get<Board[]>("/board")

  return response.data
}

export async function getMyBoards() {
  const response = await apiClient.get<Board[]>("/board/my")

  return response.data
}

export async function createBoard(payload: BoardFormValues) {
  const response = await apiClient.post<Board>("/board", payload)

  return response.data
}

export async function updateBoard(id: number, payload: BoardFormValues) {
  const response = await apiClient.patch<Board>(`/board/${id}`, payload)

  return response.data
}

export async function deleteBoard(id: number) {
  await apiClient.delete<void>(`/board/${id}`)
}

export async function getComments(boardId: number) {
  const response = await apiClient.get<Comment[]>(`/comments/${boardId}`)

  return response.data
}

export async function createComment(
  boardId: number,
  payload: CommentFormValues
) {
  const response = await apiClient.post<Comment>(`/comments/${boardId}`, payload)

  return response.data
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined

    if (Array.isArray(data?.message)) {
      return data.message.join("\n")
    }

    if (data?.message) {
      return data.message
    }

    if (data?.error) {
      return data.error
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "요청을 처리하지 못했습니다."
}

export function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
