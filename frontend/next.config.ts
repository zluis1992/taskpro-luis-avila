import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["devextreme", "devextreme-react"],
};

export default nextConfig;
