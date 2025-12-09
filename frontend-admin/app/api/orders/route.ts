import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const sort = searchParams.get("sort") || "dateTime";
    const order = searchParams.get("order") || "desc";

    // Get authorization token from cookies or headers
    const authHeader = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const response = await fetch(`${BACKEND_URL}/api/admin/orders?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(cookie && { Cookie: cookie }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch orders" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    const orders = data.orders || [];

    // Transform to match frontend interface
    const transformedOrders = orders.map((order: any) => ({
      id: order.id,
      dateTime: order.dateTime ? new Date(order.dateTime).toISOString() : new Date().toISOString(),
      customerName: order.customerName || order.email || "Unknown",
      status: order.status || "PENDING",
      total: order.total || 0,
    }));

    // Sort if needed
    if (sort === "dateTime") {
      transformedOrders.sort((a: any, b: any) => {
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        return order === "desc" ? dateB - dateA : dateA - dateB;
      });
    }

    return NextResponse.json(transformedOrders);
  } catch (error: any) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
