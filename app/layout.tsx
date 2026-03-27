import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

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
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
            <h1 className="text-lg font-bold text-gray-900">在庫管理システム</h1>
            <nav className="flex gap-4">
              <Link href="/search" className="text-sm text-gray-600 hover:text-blue-600">
                検索
              </Link>
              <Link href="/inventory" className="text-sm text-gray-600 hover:text-blue-600">
                新規登録
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
