import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api"

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getStoredToken())

  function login(nextToken: string) {
    setStoredToken(nextToken)
    setToken(nextToken)
  }

  function logout() {
    clearStoredToken()
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("AuthProvider 내부에서만 useAuth를 사용할 수 있습니다.")
  }

  return context
}
