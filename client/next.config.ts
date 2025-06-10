/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Skip type checking on build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Skip linting on build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
