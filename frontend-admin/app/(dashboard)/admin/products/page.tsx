"use client";
import {
  CustomButton,
  DashboardSidebar,
} from "@/components";
import React from "react";

const DashboardProducts = () => {
  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-4">Products Management</h1>
        <p className="text-gray-600">Product management functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default DashboardProducts;
