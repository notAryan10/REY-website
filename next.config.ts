import type { NextConfig } from "next";

// Frontend runs on Vercel, the backend stays on Render. Unset locally so
// `next dev` keeps serving app/api/* itself.
const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) return [];
    return {
      // beforeFiles, so these win over the app/api/* routes still in this repo.
      //
      // Exclusions stay on Vercel:
      //   auth/           - middleware (proxy.ts) and the server components in
      //                     app/ verify the session here anyway, so proxying it
      //                     would add a hop without moving work off Vercel.
      //   forgot-password - sends mail. Render's free tier blocks outbound SMTP
      //   register        - (ports 25/465/587), so the mailer hangs there until
      //                     the socket times out. Vercel has no such block.
      beforeFiles: [
        {
          source: "/api/:path((?!auth/|forgot-password|register).*)",
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
