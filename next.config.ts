import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "marissateachablemoments.com",
      },
    ],
  },
};

export default nextConfig;
