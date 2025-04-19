// Root layout split into server and client components

import './globals.css'
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import ClientLayout from './client-layout'

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata = {
  title: 'SoundScape AI',
  description: 'AI-powered audio environments that adapt to your surroundings and mood in real-time',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${montserrat.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}