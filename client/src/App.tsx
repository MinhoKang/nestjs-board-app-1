import { Navigate, Route, Routes } from "react-router-dom"

import { useAuth } from "@/auth-context"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { BoardDetailPage } from "@/pages/board-detail-page"
import { BoardsPage } from "@/pages/boards-page"
import { LoginPage } from "@/pages/login-page"

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/boards/:id" element={<BoardDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/boards" replace />} />
      </Routes>

      <Toaster richColors closeButton />
    </>
  )
}

export default App
