import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, MessageCircle, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth-context"
import { BoardFormDialog } from "@/components/board-form-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  createComment,
  deleteBoard,
  getBoards,
  getComments,
  getErrorMessage,
  getMyBoards,
  isUnauthorized,
  updateBoard,
} from "@/lib/api"
import {
  commentSchema,
  type BoardFormValues,
  type CommentFormValues,
} from "@/lib/schemas"
import type { Board, Comment } from "@/types"

type BoardDetail = {
  board: Board
  comments: Comment[]
  canEdit: boolean
}

async function fetchBoardDetail(boardId: number): Promise<BoardDetail> {
  const [boards, myBoards, comments] = await Promise.all([
    getBoards(),
    getMyBoards(),
    getComments(boardId),
  ])
  const board = boards.find((item) => item.id === boardId)

  if (!board) {
    throw new Error("게시글을 찾을 수 없습니다.")
  }

  return {
    board,
    comments,
    canEdit: myBoards.some((item) => item.id === boardId),
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

export function BoardDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const boardId = Number(params.id)
  const [board, setBoard] = useState<Board | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [canEdit, setCanEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  useEffect(() => {
    let ignore = false

    async function loadDetail() {
      if (!Number.isInteger(boardId) || boardId < 1) {
        setLoadError("올바른 게시글 주소가 아닙니다.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setLoadError("")

      try {
        const detail = await fetchBoardDetail(boardId)

        if (!ignore) {
          setBoard(detail.board)
          setComments(detail.comments)
          setCanEdit(detail.canEdit)
        }
      } catch (error) {
        if (isUnauthorized(error)) {
          logout()
          navigate("/login", { replace: true })
          return
        }

        if (!ignore) {
          setLoadError(getErrorMessage(error))
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      ignore = true
    }
  }, [boardId, logout, navigate])

  async function handleUpdateBoard(values: BoardFormValues) {
    if (!board) {
      return
    }

    try {
      const updatedBoard = await updateBoard(board.id, values)
      setBoard(updatedBoard)
      toast.success("게시글이 수정되었습니다.")
    } catch (error) {
      if (isUnauthorized(error)) {
        logout()
        navigate("/login", { replace: true })
      }

      throw error
    }
  }

  async function handleDeleteBoard() {
    if (!board) {
      return
    }

    const confirmed = window.confirm("게시글을 삭제할까요?")

    if (!confirmed) {
      return
    }

    try {
      await deleteBoard(board.id)
      toast.success("게시글이 삭제되었습니다.")
      navigate("/boards", { replace: true })
    } catch (error) {
      if (isUnauthorized(error)) {
        logout()
        navigate("/login", { replace: true })
        return
      }

      toast.error(getErrorMessage(error))
    }
  }

  async function handleCreateComment(values: CommentFormValues) {
    if (!board) {
      return
    }

    try {
      const nextComment = await createComment(board.id, values)
      setComments((currentComments) => [...currentComments, nextComment])
      commentForm.reset()
      toast.success("댓글이 등록되었습니다.")
    } catch (error) {
      if (isUnauthorized(error)) {
        logout()
        navigate("/login", { replace: true })
        return
      }

      commentForm.setError("root", {
        message: getErrorMessage(error),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadError || !board) {
    return (
      <div className="space-y-6">
        <Button type="button" variant="outline" asChild>
          <Link to="/boards">
            <ArrowLeft className="size-4" aria-hidden="true" />
            목록
          </Link>
        </Button>
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="pt-6 text-sm text-destructive">
            {loadError || "게시글을 표시하지 못했습니다."}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" asChild>
          <Link to="/boards">
            <ArrowLeft className="size-4" aria-hidden="true" />
            목록
          </Link>
        </Button>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <BoardFormDialog
              mode="edit"
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              defaultValues={{
                title: board.title,
                content: board.content,
                status: board.status,
              }}
              onSubmit={handleUpdateBoard}
              trigger={
                <Button type="button" variant="outline">
                  <Pencil className="size-4" aria-hidden="true" />
                  수정
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteBoard}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              삭제
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={board.status} />
            <span className="text-sm text-muted-foreground">#{board.id}</span>
          </div>
          <div>
            <CardTitle className="text-2xl">{board.title}</CardTitle>
            <CardDescription className="mt-2">
              {formatDate(board.createdAt)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="min-h-32 whitespace-pre-line leading-7">
            {board.content}
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-normal">
            댓글 {comments.length}
          </h2>
        </div>
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">댓글 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={commentForm.handleSubmit(handleCreateComment)}
            >
              <FieldGroup>
                <Controller
                  control={commentForm.control}
                  name="content"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="comment-content">내용</FieldLabel>
                      <Textarea
                        {...field}
                        id="comment-content"
                        aria-invalid={fieldState.invalid}
                        className="min-h-24"
                        placeholder="댓글을 입력하세요."
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>

              {commentForm.formState.errors.root?.message && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {commentForm.formState.errors.root.message}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={commentForm.formState.isSubmitting}
                >
                  {commentForm.formState.isSubmitting ? "등록 중" : "댓글 등록"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {comments.length ? (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {comment.user.username}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(comment.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-6">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-lg border border-dashed bg-background px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                아직 등록된 댓글이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
