import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '在庫管理システム',
  description: '在庫の登録・検索・管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 font-sans">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
            <h1 className="text-base sm:text-lg font-bold text-gray-900">在庫管理システム</h1>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6">{children}</main>
      </body>
    </html>
  )
}
