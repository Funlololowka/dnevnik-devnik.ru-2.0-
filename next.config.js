/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dnevnik.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dnevnik.ru',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
