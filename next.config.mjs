
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: process.env.PUBLIC_CDN_DOMAIN || '**' }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
  }
};
export default nextConfig;
