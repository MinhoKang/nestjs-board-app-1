import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/api"
import { boardSchema, type BoardFormValues } from "@/lib/schemas"

const emptyBoardValues: BoardFormValues = {
  title: "",
  content: "",
  status: "PUBLIC",
}

type BoardFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  defaultValues?: BoardFormValues
  trigger?: ReactNode
  onSubmit: (values: BoardFormValues) => Promise<void>
}

export function BoardFormDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  trigger,
  onSubmit,
}: BoardFormDialogProps) {
  const [submitError, setSubmitError] = useState("")
  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: defaultValues ?? emptyBoardValues,
  })
  const title = mode === "create" ? "게시글 작성" : "게시글 수정"
  const description =
    mode === "create"
      ? "제목, 내용, 공개 범위를 입력해 새 게시글을 등록합니다."
      : "현재 게시글의 제목, 내용, 공개 범위를 수정합니다."
  const submitLabel = mode === "create" ? "등록" : "저장"

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(defaultValues ?? emptyBoardValues)
      setSubmitError("")
    }

    onOpenChange(nextOpen)
  }

  async function handleSubmit(values: BoardFormValues) {
    setSubmitError("")

    try {
      await onSubmit(values)
      form.reset(emptyBoardValues)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id={`${mode}-board-form`}
          className="space-y-5"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="board-title">제목</FieldLabel>
                  <Input
                    {...field}
                    id="board-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="게시글 제목"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="board-content">내용</FieldLabel>
                  <Textarea
                    {...field}
                    id="board-content"
                    aria-invalid={fieldState.invalid}
                    className="min-h-40 resize-y"
                    placeholder="게시글 내용을 입력하세요."
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>공개 범위</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="공개 범위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">공개</SelectItem>
                      <SelectItem value="PRIVATE">비공개</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          {submitError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="submit"
            form={`${mode}-board-form`}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "처리 중" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
