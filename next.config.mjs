/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep local development independent from an old/corrupted `.next` cache.
  // Production and Cloudflare builds continue using the normal `.next` folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
