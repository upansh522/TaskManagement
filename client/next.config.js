/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "avatars.githubusercontent.com"],
  },
  output: 'standalone',
};

module.exports = nextConfig;