import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    distDir: "next",
    reactStrictMode: false,
    experimental: {
        optimizePackageImports: ["lucide-react", "react-virtuoso"],
    },
    compress: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "shopseemedia.blob.core.windows.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
    async redirects() {
        return [];
    },
};

export default nextConfig;
