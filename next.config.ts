import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Polices et images lues par le générateur de billets PDF (fs) : à embarquer dans les fonctions serverless.
  outputFileTracingIncludes: {
    "/api/orders/[id]/pdf": ["./assets/**/*"],
    "/api/orders/[id]": ["./assets/**/*"],
    "/api/fedapay/webhook": ["./assets/**/*"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
