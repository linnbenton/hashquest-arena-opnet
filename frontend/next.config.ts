/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Jangan pakai turbo, karena Windows + Turbopack sering crash
    // turbo: true,  
  },
};

module.exports = nextConfig;