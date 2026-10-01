import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: { "*": ["./evidence/**/*", "./test-results/**/*", "./data/**/*", "./tests/**/*", "./docs/**/*"] },
};

export default nextConfig;
