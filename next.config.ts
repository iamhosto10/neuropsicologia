import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb", // las imágenes subidas se limitan a 5 MB en el servidor (ver content-roles.ts)
    },
  },
};

export default nextConfig;
