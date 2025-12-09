import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  try {
    // Get authorization token from cookies or headers
    const authHeader = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const response = await fetch(`${BACKEND_URL}/api/admin/dashboard/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(cookie && { Cookie: cookie }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch dashboard overview" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Backend now provides all the stats we need
    const stats = {
      revenueToday: data.revenueToday || 0,
      revenueWeek: data.revenueWeek || 0,
      revenueMonth: data.revenueMonth || 0,
      ordersProcessing: data.ordersProcessing || 0,
      ordersDelivered: data.ordersDelivered || 0,
      ordersCancelled: data.ordersCancelled || 0,
      lowStockProducts: data.lowStockProducts || 0,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
