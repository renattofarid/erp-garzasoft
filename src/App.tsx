import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { JSX } from "react";
import HomePage from "./pages/home/components/HomePage";
import LayoutComponent from "./components/layout";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import LoginPage from "./pages/auth/components/Login";
import TypeUserPage from "./pages/type-users/components/TypeUserPage";
import { TypeUserRoute } from "./pages/type-users/lib/typeUser.interface";
import { UserRoute } from "./pages/users/lib/User.interface";
import UserPage from "./pages/users/components/UserPage";
import {
  ClientAddRoute,
  ClientEditRoute,
  ClientRoute,
} from "./pages/client/lib/client.interface";
import ClientPage from "./pages/client/components/ClientPage";
import ClientAddPage from "./pages/client/components/ClientAddPage";
import ProductPage from "./pages/products/components/ProductPage";
import { ProductRoute } from "./pages/products/lib/product.interface";
import ClientEditPage from "./pages/client/components/ClientEditPage";
import {
  ContractAddRoute,
  ContractEditRoute,
  ContractRoute,
} from "@/pages/contract/lib/contract.interface.ts";
import ContractPage from "@/pages/contract/components/ContractPage.tsx";
import ContractAddPage from "@/pages/contract/components/ContractAddPage.tsx";
import ContractEditPage from "@/pages/contract/components/ContractEditPage.tsx";
import { CuentasPorCobrarRoute } from "./pages/accounts-receivable/lib/accounts-receivable.interface";
import CuentasPorCobrarPage from "./pages/accounts-receivable/components/AccountsReceivablePage";
import InvoicingPage from "./pages/invoicing/components/InvoicingPage";
import { InvoicingRoute } from "./pages/invoicing/lib/invoicing.interface";
import LocalTypePage from "./pages/local-types/components/LocalTypePage";
import { LocalTypeRoute } from "./pages/local-types/lib/localType.interface";
import FacturadorPage from "./pages/facturador/components/FacturadorPage";
import { FacturadorRoute } from "./pages/facturador/lib/facturador.interface";
import ClientPortalPage from "./pages/client-portal/components/ClientPortalPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, user } = useAuthStore();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.cliente_id && location.pathname !== "/" && location.pathname !== "/inicio") {
    return <Navigate to="/inicio" replace />;
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

function HomeByUser() {
  const { user } = useAuthStore();
  return user?.cliente_id ? <ClientPortalPage /> : <HomePage />;
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
                <HomeByUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <HomeByUser />
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
            path={UserRoute}
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ClientRoute}
            element={
              <ProtectedRoute>
                <ClientPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ClientAddRoute}
            element={
              <ProtectedRoute>
                <ClientAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${ClientEditRoute}/:id`}
            element={
              <ProtectedRoute>
                <ClientEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ProductRoute}
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ContractRoute}
            element={
              <ProtectedRoute>
                <ContractPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ContractAddRoute}
            element={
              <ProtectedRoute>
                <ContractAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${ContractEditRoute}/:id`}
            element={
              <ProtectedRoute>
                <ContractEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={CuentasPorCobrarRoute}
            element={
              <ProtectedRoute>
                <CuentasPorCobrarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={LocalTypeRoute}
            element={
              <ProtectedRoute>
                <LocalTypePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={InvoicingRoute}
            element={
              <ProtectedRoute>
                <InvoicingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={FacturadorRoute}
            element={
              <ProtectedRoute>
                <FacturadorPage />
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
