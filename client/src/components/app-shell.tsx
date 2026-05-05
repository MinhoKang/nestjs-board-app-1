import { LogOut, MessageSquareText, SquarePen } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppShell() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    toast.message("로그아웃되었습니다.")
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink
            to="/boards"
            className="flex min-w-0 items-center gap-2 font-semibold"
          >
            <MessageSquareText className="size-5" aria-hidden="true" />
            <span className="truncate">Nest Board</span>
          </NavLink>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/boards"
              className={({ isActive }) =>
                cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
            >
              <SquarePen className="size-4" aria-hidden="true" />
              게시판
            </NavLink>
            <Button type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              로그아웃
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
