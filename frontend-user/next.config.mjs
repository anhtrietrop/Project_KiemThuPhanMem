import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Compiler optimizations (SWC minify đã mặc định trong Next.js 15+)
    compiler: {
        // Loại bỏ console.log trong production (trừ error/warn)
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Tối ưu imports - tree shaking tốt hơn
    modularizeImports: {
        'react-icons/fa': {
            transform: 'react-icons/fa/{{member}}',
        },
        'react-icons/io': {
            transform: 'react-icons/io/{{member}}',
        },
        'react-icons/md': {
            transform: 'react-icons/md/{{member}}',
        },
        'react-icons/hi': {
            transform: 'react-icons/hi/{{member}}',
        },
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{member}}',
        },
    },

    // Tối ưu images
    images: {
        formats: ['image/avif', 'image/webp'], // Sử dụng format mới nhẹ hơn
        minimumCacheTTL: 60,
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
            port: ""
          },
        ],
    },

    // Parallel processing - build nhanh hơn
    experimental: {
        workerThreads: true,
        cpus: 4,
    },

    // Fix warning về multiple lockfiles
    outputFileTracingRoot: __dirname,

    // Output standalone - DISABLED vì gây lỗi "self is not defined"
    // output: 'standalone',

    // Webpack optimization - Simplified để tránh lỗi "exports is not defined"
    webpack: (config, { isServer }) => {
        // Chỉ optimize cho client-side
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                moduleIds: 'deterministic',
            };
        }
        return config;
    },

    // Tắt source maps trong production (giảm kích thước)
    productionBrowserSourceMaps: false,

    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
    
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ];
    },
};

export default nextConfig;
