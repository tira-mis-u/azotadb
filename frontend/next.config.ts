/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests in dev
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
