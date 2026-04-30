/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // WAJIB: Biar gak 404 di Windows Production
  trailingSlash: true,

  // Optimasi build untuk project blockchain/web3
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Jika ada library web3 yang butuh path node.js
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
