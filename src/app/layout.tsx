import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'حافظ (Hafiz) - Arabic Vocabulary Flashcards',
  description: 'Turn Arabic vocabulary screenshots into interactive flashcards',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased islamic-pattern min-h-screen">
        {children}
      </body>
    </html>
  )
}
