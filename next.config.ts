import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Ajusta esto según tus necesidades. 5mb o 10mb es un buen estándar para fotos.
    },
  },
};

export default nextConfig;
