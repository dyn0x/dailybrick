import type { Metadata } from 'next'
import { Sora, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@livekit/components-styles'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
})
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DailyBrick — Daily Task Manager',
  description: 'Track your daily tasks, collaborate with your team, and stay on top of your goals with DailyBrick.',
  generator: 'DailyBrick',
  icons: {
    icon: [{ url: '/icon.svg?v=2', type: 'image/svg+xml' }],
    shortcut: [{ url: '/icon.svg?v=2', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={sora.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
