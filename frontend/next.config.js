/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/file/:path*',
        destination: 'http://localhost:9000/file/:path*' // Proxy to Backend
      }
    ]
  }
}

module.exports = nextConfig
