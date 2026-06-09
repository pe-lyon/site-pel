import type { Metadata, Viewport } from 'next'
import { Poppins, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

// Barlow Condensed = fallback institutionnel condensé pour les titres
// (remplacé par Prachason Neue Condensed si les fichiers sont dans /public/fonts/)
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parlement des Étudiants de Lyon',
  description: 'Le Parlement des Étudiants de Lyon est une institution parlementaire étudiante indépendante.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'PEL' },
}

// Next.js 14 : themeColor doit être dans viewport, pas dans metadata
export const viewport: Viewport = {
  themeColor: '#04439a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${barlowCondensed.variable}`}>
      <head>
        <link rel="icon" href="/logo-pel.png" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('pel-theme');var c=localStorage.getItem('pel-colorblind');var d=localStorage.getItem('pel-dyslexic');if(t)document.documentElement.setAttribute('data-theme',t);if(c&&c!=='none')document.documentElement.setAttribute('data-colorblind',c);if(d==='true')document.documentElement.setAttribute('data-dyslexic','true');}catch(e){}})();` }} />
      </head>
      <body>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-corps)' } }} />
        {children}
      </body>
    </html>
  )
}
