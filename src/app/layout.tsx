import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '19-20 - Professional Bill Splitting',
  description: 'Split bills with precision. Scan receipts, select items, and automatically calculate each person\'s share including tax and tips.',
  keywords: ['bill splitting', 'expense sharing', 'receipt scanner', 'group payments', '19-20'],
  authors: [{ name: '19-20' }],
  openGraph: {
    title: '19-20 - Professional Bill Splitting',
    description: 'Split bills with precision. Scan receipts, select items, and automatically calculate each person\'s share.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f0f23',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
