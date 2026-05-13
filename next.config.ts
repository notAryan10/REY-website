import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
