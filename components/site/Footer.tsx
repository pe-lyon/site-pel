import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Linkedin, Mail } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Footer() {
  const year = new Date().getFullYear()

  // Lire les réseaux sociaux depuis la base
  const { data: socialSettings } = await adminClient
    .from('site_settings')
    .select('key, value')
    .in('key', ['instagram', 'linkedin', 'email_contact'])

  const settings: Record<string, string> = {}
  ;(socialSettings ?? []).forEach((row: any) => { settings[row.key] = row.value ?? '' })

  const instagramUrl = settings['instagram'] || null
  const linkedinUrl = settings['linkedin'] || null
  const emailContact = settings['email_contact'] || 'communication.pelyon@gmail.com'

  return (
    <footer style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderTop: '1px solid rgba(255,255,255,0.70)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 -4px 24px rgba(4,67,154,0.06)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo-pel.png" alt="PEL" width={40} height={40} />
              <div>
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--pel-bleu)' }}>
                  PE DE LYON
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>Parlement des Étudiants</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'var(--font-corps)' }}>
              Institution parlementaire étudiante de la métropole lyonnaise.
            </p>
            <div className="flex gap-2 mt-4">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer"
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{ background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)', border: '1px solid rgba(4,67,154,0.12)' }}>
                  <Instagram size={16} />
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer"
                  className="p-2 rounded-xl transition-all hover:scale-110"
                  style={{ background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)', border: '1px solid rgba(4,67,154,0.12)' }}>
                  <Linkedin size={16} />
                </a>
              )}
              <a href={`mailto:${emailContact}`}
                className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)', border: '1px solid rgba(4,67,154,0.12)' }}>
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-semibold text-xs mb-4 uppercase tracking-widest" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
              Navigation
            </p>
            <ul className="space-y-2">
              {[['/', 'Accueil'], ['/presentation', 'Présentation'], ['/bureau', 'Bureau'], ['/groupes', 'Groupes'], ['/actualites', 'Actualités'], ['/agenda', 'Agenda']].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-gray-500 hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Plateforme */}
          <div>
            <p className="font-semibold text-xs mb-4 uppercase tracking-widest" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
              Plateforme
            </p>
            <ul className="space-y-2">
              {[['/seance', 'Séance en cours'], ['/seances', 'Archives séances'], ['/parlementaires', 'Parlementaires'], ['/ressources', 'Ressources'], ['/lexique', 'Lexique'], ['/login', 'Espace parlementaire']].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-gray-500 hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & newsletter */}
          <div>
            <p className="font-semibold text-xs mb-4 uppercase tracking-widest" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
              Rester informé·e
            </p>
            <ul className="space-y-2 mb-4">
              {[['/newsletter', '📧 Newsletter'], ['/presse', '📰 Espace presse'], ['/partenaires', '🤝 Partenaires'], ['/contact', 'Nous contacter']].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="text-sm text-gray-500 hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={`mailto:${emailContact}`} className="text-xs text-gray-400 hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)', wordBreak: 'break-all' }}>
              {emailContact}
            </a>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderTop: '1px solid rgba(4,67,154,0.08)' }}>
          <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>
            © {year} Parlement des Étudiants de Lyon — Tous droits réservés
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>Plateforme développée avec ❤️</p>
            <Link href="/admin/login" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
              Connexion administrative
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
