import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parlement des Étudiants de Lyon',
  description: 'Le Parlement des Étudiants de Lyon est une institution parlementaire étudiante indépendante.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
      <head>
        <link rel="icon" href="/logo-pel.png" />
      </head>
      <body>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-corps)' } }} />
        {children}
      </body>
    </html>
  )
}
