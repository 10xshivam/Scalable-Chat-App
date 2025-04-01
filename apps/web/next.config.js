/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://scalable-chat-app-docs-orcin.vercel.app/:path*'
      }
    ];
  }
};

export default nextConfig;
