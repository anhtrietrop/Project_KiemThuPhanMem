import { NextResponse } from "next/server";

export async function GET() {
  // Mock data - thay bằng query database thực
  const stats = {
    revenueToday: 15000000,
    revenueWeek: 85000000,
    revenueMonth: 320000000,
    ordersProcessing: 12,
    ordersDelivered: 45,
    ordersCancelled: 3,
    lowStockProducts: 8,
  };

  return NextResponse.json(stats);
}
