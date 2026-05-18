import { zodResolver } from "@hookform/resolvers/zod"
import { LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import {
  Controller,
  useForm,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
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
  FieldLegend,
  FieldSet,
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
import { cn } from "@/lib/utils"
import type { AuthFlow, AuthMethod } from "@/types"

const authFlowOptions = [
  { value: "combined", label: "동시" },
  { value: "separated", label: "분리" },
] satisfies ReadonlyArray<{ value: AuthFlow; label: string }>

const authMethodOptions = [
  { value: "plain", label: "기본" },
  { value: "hash", label: "해시" },
  { value: "hash-newline", label: "해시+개행" },
] satisfies ReadonlyArray<{ value: AuthMethod; label: string }>

type RadioOptionGroupProps<T extends FieldValues> = {
  control: Control<T>
  idPrefix: string
  legend: string
  name: FieldPath<T>
  options: ReadonlyArray<{ value: string; label: string }>
}

function RadioOptionGroup<T extends FieldValues>({
  control,
  idPrefix,
  legend,
  name,
  options,
}: RadioOptionGroupProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldSet className="gap-2" data-invalid={fieldState.invalid}>
          <FieldLegend variant="label">{legend}</FieldLegend>
          <div
            data-slot="radio-group"
            className={cn(
              "grid gap-2",
              options.length > 2 ? "grid-cols-3" : "grid-cols-2"
            )}
          >
            {options.map((option) => {
              const optionId = `${idPrefix}-${name}-${option.value}`
              const checked = field.value === option.value

              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={cn(
                    "flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                    checked
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-input hover:bg-accent/50"
                  )}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={checked}
                    onBlur={field.onBlur}
                    onChange={() => field.onChange(option.value)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </label>
              )
            })}
          </div>
          <FieldError errors={[fieldState.error]} />
        </FieldSet>
      )}
    />
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [activeTab, setActiveTab] = useState("signin")
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
      authFlow: "combined",
      authMethod: "plain",
    },
  })
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      password: "",
      nickname: "",
      authFlow: "combined",
      authMethod: "plain",
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

                  <RadioOptionGroup
                    control={signInForm.control}
                    idPrefix="signin"
                    legend="인증 흐름"
                    name="authFlow"
                    options={authFlowOptions}
                  />

                  <RadioOptionGroup
                    control={signInForm.control}
                    idPrefix="signin"
                    legend="비밀번호 방식"
                    name="authMethod"
                    options={authMethodOptions}
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

                  <RadioOptionGroup
                    control={signUpForm.control}
                    idPrefix="signup"
                    legend="인증 흐름"
                    name="authFlow"
                    options={authFlowOptions}
                  />

                  <RadioOptionGroup
                    control={signUpForm.control}
                    idPrefix="signup"
                    legend="비밀번호 방식"
                    name="authMethod"
                    options={authMethodOptions}
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
