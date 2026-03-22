import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["devextreme", "devextreme-react"],
  webpack: (config) => {
    // Redirect all devextreme/esm/* imports to CJS equivalents.
    // The trailing slash enables webpack prefix-matching (subpath aliasing).
    config.resolve.alias["devextreme/esm/"] = path.resolve(
      "./node_modules/devextreme/cjs/"
    );
    return config;
  },
};

export default nextConfig;
