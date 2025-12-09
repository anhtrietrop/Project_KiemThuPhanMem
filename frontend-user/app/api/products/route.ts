import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get all query parameters and forward them to backend
    const queryString = searchParams.toString();

    // Get authorization token from cookies or headers
    const authHeader = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const backendUrl = `${BACKEND_URL}/api/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(cookie && { Cookie: cookie }),
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error('Backend products API error:', response.status, response.statusText);
      const error = await response.json().catch(() => ({ message: "Failed to fetch products" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    
    // Backend returns { products: [...] } or just [...]
    const products = data.products || data || [];

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
