/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bharatstore/shared', '@bharatstore/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
