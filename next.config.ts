import type { NextConfig } from "next";

// Frontend runs on Vercel, the backend stays on Render. Unset locally so
// `next dev` keeps serving app/api/* itself.
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) return [];
    return {
      // beforeFiles, so these win over the app/api/* routes still in this repo.
      // /api/auth/* is excluded: middleware (proxy.ts) and the server components
      // in app/ verify the session on Vercel, so proxying auth would add a hop
      // to every request without moving anything off Vercel.
      beforeFiles: [
        {
          source: "/api/:path((?!auth/).*)",
          destination: `${BACKEND_URL}/api/:path`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Optimization: Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Optimization: Experimental features for faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
