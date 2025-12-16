"use client";
import React from "react";
import { useSession } from "next-auth/react";
import DashboardOrdersTable from "@/components/dashboard/DashboardOrdersTable";
import DashboardProductsTable from "@/components/dashboard/DashboardProductsTable";
import { useRecentOrders } from "@/hooks/useRecentOrders";
import { useTopProducts } from "@/hooks/useTopProducts";

const AdminDashboardPage = () => {
  const { data: session } = useSession();
  const { orders, isLoading: ordersLoading } = useRecentOrders(10);
  const { products, isLoading: productsLoading } = useTopProducts(10);

  const displayName = session?.user?.name || "Admin User";
  const displayEmail = session?.user?.email || "admin@example.com";
  const initial = (session?.user?.name || session?.user?.email || "A")[0].toUpperCase();

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">Tổng quan hoạt động hệ thống</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{displayEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {initial}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Tables Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div>
            {ordersLoading ? (
              <div className="skeleton h-96 w-full"></div>
            ) : (
              <DashboardOrdersTable rows={orders} />
            )}
          </div>
          <div>
            {productsLoading ? (
              <div className="skeleton h-96 w-full"></div>
            ) : (
              <DashboardProductsTable rows={products} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
