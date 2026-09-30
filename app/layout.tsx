import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeGuard AI — Workplace Safety Training Simulations',
  description:
    'AI-powered workplace safety training platform combining realistic incident videos, interactive 3D simulations, WebXR training, and adaptive AI feedback. Transform compliance training into decision-making simulations.',
  keywords: ['workplace safety', 'safety training', 'forklift safety', 'VR training', 'AI safety', 'OSHA compliance'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
