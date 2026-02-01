import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import StorefrontPage from "./pages/StorefrontPage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminAuthPage from "./pages/admin/AdminAuthPage";
import CreateStorePage from "./pages/admin/CreateStorePage";
import OnboardingPage from "./pages/admin/OnboardingPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <StoreProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes - Demo store */}
                  <Route path="/" element={<Index />} />
                  <Route path="/produtos" element={<ProductsPage />} />
                  <Route path="/produto/:id" element={<ProductPage />} />
                  <Route path="/categoria/:slug" element={<CategoryPage />} />
                  <Route path="/carrinho" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  
                  {/* Dynamic store routes */}
                  <Route path="/loja/:slug" element={<StorefrontPage />} />
                  <Route path="/loja/:slug/produto/:productId" element={<StorefrontPage />} />
                  <Route path="/loja/:slug/categoria/:categorySlug" element={<StorefrontPage />} />
                  <Route path="/loja/:slug/carrinho" element={<StorefrontPage />} />
                  <Route path="/loja/:slug/checkout" element={<StorefrontPage />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminAuthPage />} />
                  <Route path="/admin/criar-loja" element={
                    <AuthProvider>
                      <AdminProvider>
                        <CreateStorePage />
                      </AdminProvider>
                    </AuthProvider>
                  } />
                  <Route path="/admin/onboarding" element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/produtos" element={
                    <ProtectedRoute>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/categorias" element={
                    <ProtectedRoute>
                      <AdminCategoriesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/pedidos" element={
                    <ProtectedRoute>
                      <AdminOrdersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/pagamentos" element={
                    <ProtectedRoute>
                      <PaymentsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/configuracoes" element={
                    <ProtectedRoute>
                      <AdminSettingsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </StoreProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
