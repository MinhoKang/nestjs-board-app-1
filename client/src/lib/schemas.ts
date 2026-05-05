import { z } from "zod"

import { boardStatuses } from "@/types"

const passwordRegex = /^[a-zA-Z0-9]*$/

export const signInSchema = z.object({
  username: z
    .string()
    .min(3, "아이디는 3자 이상이어야 합니다.")
    .max(10, "아이디는 10자 이하여야 합니다."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(20, "비밀번호는 20자 이하여야 합니다.")
    .regex(passwordRegex, "비밀번호는 영문과 숫자로만 입력해주세요."),
})

export const signUpSchema = signInSchema.extend({
  nickname: z.string().trim().min(1, "닉네임을 입력해주세요."),
})

export const boardSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요."),
  content: z.string().trim().min(1, "내용을 입력해주세요."),
  status: z.enum(boardStatuses),
})

export const commentSchema = z.object({
  content: z.string().trim().min(1, "댓글을 입력해주세요."),
})

export type SignInFormValues = z.infer<typeof signInSchema>
export type SignUpFormValues = z.infer<typeof signUpSchema>
export type BoardFormValues = z.infer<typeof boardSchema>
export type CommentFormValues = z.infer<typeof commentSchema>
