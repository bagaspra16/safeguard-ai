import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Enable server actions
  },
  // Allow cross-origin for 3D assets
  images: {
    domains: [],
  },
  // Transpile Three.js and R3F packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr'],
}

export default nextConfig
