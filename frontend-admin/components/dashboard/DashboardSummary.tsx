"use client";
import React from "react";
import { formatCurrencyVND } from "@/utils/currency";
import { FaArrowUp, FaArrowDown, FaBoxOpen, FaCircleCheck, FaCircleXmark, FaTriangleExclamation } from "react-icons/fa6";

interface SummaryStats {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  ordersProcessing: number;
  ordersDelivered: number;
  ordersCancelled: number;
  lowStockProducts: number;
}

export default function DashboardSummary({ stats }: { stats: SummaryStats }) {
  const primaryCards = [
    { 
      label: "Doanh thu tháng", 
      value: formatCurrencyVND(stats.revenueMonth),
      icon: FaArrowUp,
      gradient: "from-primary-500 to-primary-700",
      change: "+12.5%"
    },
    { 
      label: "Doanh thu tuần", 
      value: formatCurrencyVND(stats.revenueWeek),
      icon: FaArrowUp,
      gradient: "from-blue-500 to-blue-700",
      change: "+8.2%"
    },
    { 
      label: "Doanh thu hôm nay", 
      value: formatCurrencyVND(stats.revenueToday),
      icon: FaArrowDown,
      gradient: "from-purple-500 to-purple-700",
      change: "-3.1%"
    },
    { 
      label: "Đơn đã giao", 
      value: (stats.ordersDelivered ?? 0).toString(),
      icon: FaCircleCheck,
      gradient: "from-accent-500 to-accent-700",
      change: "+15.3%"
    },
  ];

  const secondaryCards = [
    { label: "Đơn đang xử lý", value: (stats.ordersProcessing ?? 0).toString(), icon: FaBoxOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Đơn đã hủy", value: (stats.ordersCancelled ?? 0).toString(), icon: FaCircleXmark, color: "text-red-600", bg: "bg-red-50" },
    { label: "Sản phẩm sắp hết", value: (stats.lowStockProducts ?? 0).toString(), icon: FaTriangleExclamation, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats - Large Cards with Gradient */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {primaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden`}
            >
              <div className="p-6 text-white relative">
                <div className="absolute top-4 right-4 opacity-20">
                  <Icon className="text-5xl" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium opacity-90 mb-2">{card.label}</p>
                  <p className="text-3xl font-bold mb-3">{card.value}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${card.change.startsWith('+') ? 'bg-white/20' : 'bg-black/20'}`}>
                      {card.change}
                    </span>
                    <span className="text-xs opacity-75">so với tuần trước</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secondaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg shadow border border-slate-200 hover:shadow-md transition-all duration-200 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
