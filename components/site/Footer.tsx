import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ background: 'var(--pel-bleu)', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo-pel.png" alt="PEL" width={40} height={40} style={{ filter: 'brightness(0) invert(1)' }} />
              <div>
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', fontWeight: 700 }}>PE DE LYON</p>
                <p className="text-xs text-blue-200">Parlement des Étudiants</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed">
              Institution parlementaire étudiante de la métropole lyonnaise.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/pel_lyon" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><Instagram size={16} /></a>
              <a href="https://linkedin.com/company/pel-lyon" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><Linkedin size={16} /></a>
              <a href="mailto:communication.pelyon@gmail.com" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><Mail size={16} /></a>
            </div>
          </div>
          {/* Navigation */}
          <div>
            <p className="font-semibold text-sm mb-4 text-blue-200 uppercase tracking-wider">Navigation</p>
            <ul className="space-y-2 text-sm text-blue-100">
              {[['/', 'Accueil'], ['/presentation', 'Présentation'], ['/bureau', 'Bureau'], ['/groupes', 'Groupes'], ['/actualites', 'Actualités'], ['/agenda', 'Agenda']].map(([h, l]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Plateforme */}
          <div>
            <p className="font-semibold text-sm mb-4 text-blue-200 uppercase tracking-wider">Plateforme</p>
            <ul className="space-y-2 text-sm text-blue-100">
              {[['/seance', 'Séance en cours'], ['/ressources', 'Ressources'], ['/contact', 'Contact'], ['/login', 'Espace parlementaire']].map(([h, l]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <p className="font-semibold text-sm mb-4 text-blue-200 uppercase tracking-wider">Contact</p>
            <p className="text-sm text-blue-100">communication.pelyon@gmail.com</p>
            <p className="text-sm text-blue-100 mt-2">Université de Lyon</p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-blue-200">
          <p>© {year} Parlement des Étudiants de Lyon — Tous droits réservés</p>
          <div className="flex items-center gap-4">
            <p>Plateforme développée avec ❤️</p>
            <Link href="/admin" className="text-white/20 hover:text-white/50 transition-colors text-xs">
              Connexion administrative
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
