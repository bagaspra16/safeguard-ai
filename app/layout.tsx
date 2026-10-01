import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClumsAI — Construction License Prep & Safety Simulations',
  description:
    'ClumsAI helps construction workers prepare for licensing and certification through workplace safety quizzes, interactive 3D simulations, and AI-powered certification training. Build Safer. Certify Smarter.',
  keywords: ['construction license prep', 'workplace safety', 'safety training', 'forklift safety', 'AI safety', 'OSHA compliance', 'ClumsAI'],
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
