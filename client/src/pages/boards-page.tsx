import { Plus, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth-context"
import { BoardFormDialog } from "@/components/board-form-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  createBoard,
  getBoards,
  getErrorMessage,
  getMyBoards,
  isUnauthorized,
} from "@/lib/api"
import type { BoardFormValues } from "@/lib/schemas"
import type { Board } from "@/types"

type BoardLists = {
  boards: Board[]
  myBoards: Board[]
}

async function fetchBoardLists(): Promise<BoardLists> {
  const [boards, myBoards] = await Promise.all([getBoards(), getMyBoards()])

  return { boards, myBoards }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

function BoardGrid({ boards, emptyText }: { boards: Board[]; emptyText: string }) {
  if (!boards.length) {
    return (
      <div className="rounded-lg border border-dashed bg-background px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {boards.map((board) => (
        <Link
          key={board.id}
          to={`/boards/${board.id}`}
          className="block rounded-lg outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card className="h-full transition-colors hover:border-foreground/30">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={board.status} />
                <span className="text-xs text-muted-foreground">
                  #{board.id}
                </span>
              </div>
              <CardTitle className="line-clamp-2 text-lg">
                {board.title}
              </CardTitle>
              <CardDescription>{formatDate(board.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                {board.content}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function BoardGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function BoardsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [myBoards, setMyBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadBoards() {
      setIsLoading(true)
      setLoadError("")

      try {
        const nextLists = await fetchBoardLists()

        if (!ignore) {
          setBoards(nextLists.boards)
          setMyBoards(nextLists.myBoards)
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

    void loadBoards()

    return () => {
      ignore = true
    }
  }, [logout, navigate])

  async function refreshBoards() {
    setIsLoading(true)
    setLoadError("")

    try {
      const nextLists = await fetchBoardLists()
      setBoards(nextLists.boards)
      setMyBoards(nextLists.myBoards)
    } catch (error) {
      if (isUnauthorized(error)) {
        logout()
        navigate("/login", { replace: true })
        return
      }

      setLoadError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateBoard(values: BoardFormValues) {
    try {
      await createBoard(values)
      const nextLists = await fetchBoardLists()
      setBoards(nextLists.boards)
      setMyBoards(nextLists.myBoards)
      toast.success("게시글이 등록되었습니다.")
    } catch (error) {
      if (isUnauthorized(error)) {
        logout()
        navigate("/login", { replace: true })
      }

      throw error
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">게시판</Badge>
          <h1 className="text-3xl font-semibold tracking-normal">게시글 목록</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            전체 게시글과 내가 작성한 게시글을 확인하고 새 게시글을 작성합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={refreshBoards}>
            <RefreshCw className="size-4" aria-hidden="true" />
            새로고침
          </Button>
          <BoardFormDialog
            mode="create"
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSubmit={handleCreateBoard}
            trigger={
              <Button type="button">
                <Plus className="size-4" aria-hidden="true" />
                작성
              </Button>
            }
          />
        </div>
      </section>

      <Separator />

      {loadError && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="pt-6 text-sm text-destructive">
            {loadError}
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={refreshBoards}>
              다시 시도
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">전체 게시글 {boards.length}</TabsTrigger>
          <TabsTrigger value="mine">내 게시글 {myBoards.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <BoardGridSkeleton />
          ) : (
            <BoardGrid boards={boards} emptyText="등록된 게시글이 없습니다." />
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {isLoading ? (
            <BoardGridSkeleton />
          ) : (
            <BoardGrid
              boards={myBoards}
              emptyText="아직 작성한 게시글이 없습니다."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
