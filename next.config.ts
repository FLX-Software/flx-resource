import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [48, 64, 96, 128, 256, 384, 512],
    imageSizes: [32, 48, 64, 80, 96, 128, 256, 512],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
