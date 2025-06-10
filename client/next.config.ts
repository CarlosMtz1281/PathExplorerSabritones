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
  images: {
    domains: ["avatar.iran.liara.run"],
  },
};

module.exports = nextConfig;
