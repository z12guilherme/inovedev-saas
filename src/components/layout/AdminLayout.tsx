import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
// import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* <AdminSidebar /> */}
        <main className="flex-1 p-8"><Outlet /></main>
      </div>
    </ProtectedRoute>
  );
}
