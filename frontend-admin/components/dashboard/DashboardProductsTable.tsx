"use client";
import React from "react";
import Link from "next/link";
import { formatCurrencyVND } from "@/utils/currency";
import { Badge } from "@/components/ui";
import { FaEdit } from "react-icons/fa";

interface ProductRow {
  id: string;
  title: string;
  price: number;
  quantity: number;
  inStock: number;
}

interface Props {
  rows: ProductRow[];
  onSortChange?: (key: keyof ProductRow) => void;
}

export default function DashboardProductsTable({ rows, onSortChange }: Props) {
  const safeRows = Array.isArray(rows) ? rows : [];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Sản phẩm</h3>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý kho hàng</p>
        </div>
        <Link href="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Xem tất cả →
        </Link>
      </div>
      <div className="overflow-x-auto">
        {safeRows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-slate-400 text-5xl mb-4">📦</div>
            <p className="text-slate-600 font-medium">Chưa có sản phẩm</p>
            <p className="text-slate-500 text-sm mt-1">Thêm sản phẩm để bắt đầu</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {safeRows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">{p.title}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrencyVND(p.price)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{p.quantity} sản phẩm</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={(p.quantity ?? 0) > 0 ? "success" : "danger"} size="sm">
                      {(p.quantity ?? 0) > 0 ? "Còn hàng" : "Hết hàng"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/admin/products/${p.id}`} 
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <FaEdit /> Sửa
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
