import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Transpile Three.js and R3F packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr'],
}

export default nextConfig
