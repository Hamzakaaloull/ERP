/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep image optimization settings — safe and helpful for performance
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 128, 256, 384],
  },
};

export default nextConfig;
