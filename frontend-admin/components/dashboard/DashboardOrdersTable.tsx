"use client";
import React from "react";
import Link from "next/link";
import { formatCurrencyVND } from "@/utils/currency";
import { Badge } from "@/components/ui";
import { FaEye } from "react-icons/fa6";

interface OrderRow {
  id: string;
  dateTime: string;
  customerName: string;
  status: string;
  total: number;
}

interface Props {
  rows: OrderRow[];
  onSortChange?: (key: keyof OrderRow) => void;
}

const getStatusVariant = (status: string) => {
  const statusMap: Record<string, any> = {
    delivered: 'success',
    processing: 'info',
    pending: 'warning',
    cancelled: 'danger',
  };
  return statusMap[status.toLowerCase()] || 'default';
};

export default function DashboardOrdersTable({ rows, onSortChange }: Props) {
  const safeRows = Array.isArray(rows) ? rows : [];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Đơn hàng gần đây</h3>
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi đơn hàng mới nhất</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Xem tất cả →
        </Link>
      </div>
      <div className="overflow-x-auto">
        {safeRows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-slate-400 text-5xl mb-4">📦</div>
            <p className="text-slate-600 font-medium">Chưa có đơn hàng</p>
            <p className="text-slate-500 text-sm mt-1">Đơn hàng mới sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {safeRows.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-900">#{o.id.slice(0,8)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{o.customerName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{new Date(o.dateTime).toLocaleDateString("vi-VN")}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(o.status)} size="sm">{o.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrencyVND(o.total)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/admin/orders/${o.id}`} 
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <FaEye /> Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
