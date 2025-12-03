// *********************
// Role of the component: Modern sidebar navigation for admin dashboard
// Name of the component: DashboardSidebar.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <DashboardSidebar />
// Input parameters: no input parameters
// Output: modern sidebar with grouped navigation
// *********************

"use client";
import React, { useState } from "react";
import { MdDashboard, MdCategory } from "react-icons/md";
import { FaTable, FaRegUser, FaGear, FaBagShopping, FaStore, FaBars, FaXmark } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "Tổng quan",
      items: [
        { href: "/admin", icon: MdDashboard, label: "Dashboard" },
      ],
    },
    {
      title: "Quản lý",
      items: [
        { href: "/admin/orders", icon: FaBagShopping, label: "Đơn hàng" },
        { href: "/admin/products", icon: FaTable, label: "Sản phẩm" },
        { href: "/admin/categories", icon: MdCategory, label: "Danh mục" },
        { href: "/admin/users", icon: FaRegUser, label: "Người dùng" },
        { href: "/admin/merchant", icon: FaStore, label: "Merchant" },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        { href: "/admin/settings", icon: FaGear, label: "Cấu hình" },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg"
      >
        {isOpen ? <FaXmark className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed xl:sticky top-0 h-screen
          w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-all duration-200 group relative
                          ${active 
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/50' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }
                        `}
                      >
                        {active && (
                          <span className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                        )}
                        <Icon className={`text-xl ${active ? 'ml-2' : ''}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
