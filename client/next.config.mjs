/** @type {import('next').NextConfig} */
const nextConfig = {
	swcMinify: true,
	images: {
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 60,
		deviceSizes: [320, 420, 768, 1024, 1200],
		imageSizes: [16, 32, 48, 64, 128, 256, 384]
	},
	experimental: {
		// Enable future optimizations; safe with recent Next.js versions
		optimizeCss: true
	}
};

export default nextConfig;
