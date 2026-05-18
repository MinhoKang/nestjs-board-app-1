import { zodResolver } from "@hookform/resolvers/zod"
import { LogOut, MessageSquareText, SquarePen, Trash2 } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth-context"
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
import { deleteAccount, getErrorMessage } from "@/lib/api"
import {
  deleteAccountSchema,
  type DeleteAccountFormValues,
} from "@/lib/schemas"
import { cn } from "@/lib/utils"

const emptyDeleteAccountValues: DeleteAccountFormValues = {
  password: "",
  passwordConfirm: "",
}

type DeleteAccountDialogProps = {
  onDeleted: () => void
}

function DeleteAccountDialog({ onDeleted }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: emptyDeleteAccountValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(emptyDeleteAccountValues)
      form.clearErrors()
    }

    setOpen(nextOpen)
  }

  async function handleDeleteAccount(values: DeleteAccountFormValues) {
    try {
      await deleteAccount(values)
      setOpen(false)
      form.reset(emptyDeleteAccountValues)
      onDeleted()
    } catch (error) {
      form.setError("root", {
        message: getErrorMessage(error),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Trash2 className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">회원탈퇴</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회원 탈퇴</DialogTitle>
          <DialogDescription>
            계정을 삭제하려면 현재 비밀번호를 다시 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form
          id="delete-account-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(handleDeleteAccount)}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="delete-account-password">
                    비밀번호
                  </FieldLabel>
                  <Input
                    {...field}
                    id="delete-account-password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    placeholder="8-20자 영문/숫자"
                    type="password"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="passwordConfirm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="delete-account-password-confirm">
                    비밀번호 확인
                  </FieldLabel>
                  <Input
                    {...field}
                    id="delete-account-password-confirm"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    placeholder="비밀번호 재입력"
                    type="password"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          {form.formState.errors.root?.message && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="delete-account-form"
            variant="destructive"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "탈퇴 처리 중" : "회원탈퇴"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    toast.message("로그아웃되었습니다.")
    navigate("/login", { replace: true })
  }

  function handleAccountDeleted() {
    logout()
    toast.success("회원 탈퇴가 완료되었습니다.")
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
            <DeleteAccountDialog onDeleted={handleAccountDeleted} />
            <Button type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">로그아웃</span>
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
