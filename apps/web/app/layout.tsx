import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GenFlow - Job Position Generator',
  description: 'AI-powered platform for job position generation and business analysis',
  keywords: ['job position', 'business analysis', 'HR', 'AI', 'human resources'],
  authors: [{ name: 'GenFlow Team' }],
  openGraph: {
    title: 'GenFlow - Job Position Generator',
    description: 'AI-powered platform for job position generation and business analysis',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-primary)] antialiased">
        {children}
      </body>
    </html>
  )
}
