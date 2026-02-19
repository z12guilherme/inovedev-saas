import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar"; // Componente hipotético para o menu
import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* <AdminSidebar />  Você pode adicionar um menu lateral aqui */}
        <main className="flex-1 p-8"><Outlet /></main>
      </div>
    </ProtectedRoute>
  );
}