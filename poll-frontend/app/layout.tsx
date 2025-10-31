import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuickPoll - Real-time Opinion Polling',
  description: 'Create, vote, and share polls with real-time updates',
  keywords: ['polling', 'voting', 'opinions', 'realtime', 'democracy'],
  authors: [{ name: 'QuickPoll Team' }],
  openGraph: {
    title: 'QuickPoll - Real-time Opinion Polling',
    description: 'Create, vote, and share polls with real-time updates',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              <SocketProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </SocketProvider>
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
