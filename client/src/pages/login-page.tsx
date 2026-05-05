import { zodResolver } from "@hookform/resolvers/zod"
import { LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/auth-context"
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
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getErrorMessage, signIn, signUp } from "@/lib/api"
import {
  signInSchema,
  type SignInFormValues,
  signUpSchema,
  type SignUpFormValues,
} from "@/lib/schemas"

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [activeTab, setActiveTab] = useState("signin")
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      password: "",
      nickname: "",
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />
  }

  async function handleSignIn(values: SignInFormValues) {
    try {
      const { accessToken } = await signIn(values)
      login(accessToken)
      toast.success("로그인되었습니다.")
      navigate("/boards", { replace: true })
    } catch (error) {
      signInForm.setError("root", {
        message: getErrorMessage(error),
      })
    }
  }

  async function handleSignUp(values: SignUpFormValues) {
    try {
      await signUp(values)
      signUpForm.reset()
      setActiveTab("signin")
      toast.success("회원가입이 완료되었습니다.")
    } catch (error) {
      signUpForm.setError("root", {
        message: getErrorMessage(error),
      })
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>게시판 로그인</CardTitle>
          <CardDescription>
            서버 계정으로 로그인하거나 새 계정을 등록하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">
                <LogIn className="size-4" aria-hidden="true" />
                로그인
              </TabsTrigger>
              <TabsTrigger value="signup">
                <UserPlus className="size-4" aria-hidden="true" />
                회원가입
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="pt-5">
              <form
                className="space-y-5"
                onSubmit={signInForm.handleSubmit(handleSignIn)}
              >
                <FieldGroup>
                  <Controller
                    control={signInForm.control}
                    name="username"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signin-username">
                          아이디
                        </FieldLabel>
                        <Input
                          {...field}
                          id="signin-username"
                          aria-invalid={fieldState.invalid}
                          autoComplete="username"
                          placeholder="3-10자"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={signInForm.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signin-password">
                          비밀번호
                        </FieldLabel>
                        <Input
                          {...field}
                          id="signin-password"
                          aria-invalid={fieldState.invalid}
                          autoComplete="current-password"
                          placeholder="8-20자 영문/숫자"
                          type="password"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </FieldGroup>

                {signInForm.formState.errors.root?.message && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {signInForm.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signInForm.formState.isSubmitting}
                >
                  {signInForm.formState.isSubmitting ? "로그인 중" : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="pt-5">
              <form
                className="space-y-5"
                onSubmit={signUpForm.handleSubmit(handleSignUp)}
              >
                <FieldGroup>
                  <Controller
                    control={signUpForm.control}
                    name="username"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-username">
                          아이디
                        </FieldLabel>
                        <Input
                          {...field}
                          id="signup-username"
                          aria-invalid={fieldState.invalid}
                          autoComplete="username"
                          placeholder="3-10자"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={signUpForm.control}
                    name="nickname"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-nickname">
                          닉네임
                        </FieldLabel>
                        <Input
                          {...field}
                          id="signup-nickname"
                          aria-invalid={fieldState.invalid}
                          autoComplete="nickname"
                          placeholder="표시 이름"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={signUpForm.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-password">
                          비밀번호
                        </FieldLabel>
                        <Input
                          {...field}
                          id="signup-password"
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                          placeholder="8-20자 영문/숫자"
                          type="password"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </FieldGroup>

                {signUpForm.formState.errors.root?.message && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {signUpForm.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signUpForm.formState.isSubmitting}
                >
                  {signUpForm.formState.isSubmitting
                    ? "가입 처리 중"
                    : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
