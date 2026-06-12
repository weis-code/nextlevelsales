import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Next Level Sales',
  description: 'Sales performance tracking system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="bg-zinc-950 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
