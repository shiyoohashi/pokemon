import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pokemon",
  assetPrefix: "/pokemon",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
