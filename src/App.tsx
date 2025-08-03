// import { Button } from "@/components/ui/button";
// import { ThemeProvider } from "./components/theme-provider";
// import { ModeToggle } from "./components/mode-toggle";

// function App() {
//   return (
//     <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
//       <div className="flex min-h-svh flex-col items-center justify-center">
//         <Button>Iniciar sesión</Button>
//       </div>
//       <ModeToggle />
//     </ThemeProvider>
//   );
// }

// export default App;

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import HomePage from "./pages/home/components/HomePage";
import LayoutComponent from "./components/layout";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import LoginPage from "./pages/auth/components/Login";
import TypeUserPage from "./pages/type-users/components/TypeUserPage";
import {
  TypeUserAddRoute,
  TypeUserEditRoute,
  TypeUserRoute,
} from "./pages/type-users/lib/typeUser.interface";
import TypeUserAddPage from "./pages/type-users/components/TypeUserAddPage";
import TypeUserEditPage from "./pages/type-users/components/TypeUserEditPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function App() {
  const { token } = useAuthStore();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route
            path="/login"
            element={token ? <Navigate to="/inicio" /> : <LoginPage />}
          />

          {/* Ruta protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={TypeUserRoute}
            element={
              <ProtectedRoute>
                <TypeUserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={TypeUserAddRoute}
            element={
              <ProtectedRoute>
                <TypeUserAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${TypeUserEditRoute}/:id`}
            element={
              <ProtectedRoute>
                <TypeUserEditPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/inicio" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
