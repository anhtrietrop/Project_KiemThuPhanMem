// Detect if running server-side
const isServerSide = typeof window === "undefined";

const config = {
  // For server-side rendering in Docker, use internal Docker network
  // For client-side (browser), use localhost (accessible from host machine)
  apiBaseUrl:
    isServerSide && process.env.API_INTERNAL_URL
      ? process.env.API_INTERNAL_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002",
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3001",
};

export default config;
