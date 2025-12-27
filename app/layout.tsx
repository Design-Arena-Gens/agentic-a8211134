import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'تبدیل عکس به ویدیو',
  description: 'ساخت ویدیو از عکس با هوش مصنوعی',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
