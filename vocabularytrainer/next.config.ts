import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  images: { domains: ["encrypted-tbn0.gstatic.com", ""] },
};

export default nextConfig;
