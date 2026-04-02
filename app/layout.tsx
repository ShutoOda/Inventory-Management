import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

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
      <body className="min-h-full bg-slate-100 font-sans">
        {/* ヘッダー */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-slate-800 z-30 flex items-center px-4 shadow-md">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-white font-bold text-base tracking-wide">在庫管理システム</span>
          </div>
        </header>

        {/* サイドバー */}
        <Sidebar />

        {/* メインコンテンツ */}
        <main className="ml-44 mt-14 min-h-screen bg-slate-100 p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
