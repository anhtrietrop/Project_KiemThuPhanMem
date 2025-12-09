import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const mode = searchParams.get("mode") || "admin";

    // Get authorization token from cookies or headers
    const authHeader = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const response = await fetch(`${BACKEND_URL}/api/products?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(cookie && { Cookie: cookie }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch products" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    const products = data.products || data || [];

    // Transform to match frontend interface
    const transformedProducts = products.slice(0, parseInt(limit)).map((product: any) => ({
      id: product.id,
      title: product.title || product.name || "Untitled",
      price: product.price || 0,
      quantity: product.quantity || 0,
      inStock: product.inStock !== undefined ? product.inStock : product.stock || 0,
    }));

    return NextResponse.json(transformedProducts);
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
