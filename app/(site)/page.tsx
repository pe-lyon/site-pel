import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const revalidate = 60

async function getSettings() {
  return {
    hero_titre: 'PARLEMENT DES ÉTUDIANTS DE LYON',
    hero_sous_titre: "L'institution parlementaire étudiante de référence à Lyon",
    pel_bref_texte: "Le Parlement des Étudiants de Lyon est une simulation parlementaire universitaire fondée sur les principes de la démocratie représentative."
  }
}

export default async function HomePage() {
  const settings = await getSettings()

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Fond bleu avec motif géométrique */}
        <div className="absolute inset-0" style={{ background: 'var(--pel-bleu)' }}>
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'var(--pel-rouge)' }} />
          <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full opacity-5" style={{ background: 'white' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-24">
          {/* Bandeau institutionnel */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span style={{ fontFamily: 'var(--font-corps)' }}>Session 2025-2026 en cours</span>
          </div>

          <h1 className="mb-6 text-white" style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '0.02em',
          }}>
            {settings.hero_titre}
          </h1>

          <p className="text-blue-100 max-w-2xl mx-auto mb-10 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-corps)' }}>
            {settings.hero_sous_titre}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/presentation" className="btn-primary text-base px-8 py-3">
              Découvrir le PEL
            </Link>
            <Link href="/seance" className="inline-flex items-center justify-center px-8 py-3 rounded font-semibold text-base transition-all duration-200 cursor-pointer border-2 hover:bg-white hover:text-[#04439a]" style={{ borderColor: 'white', color: 'white', background: 'transparent', fontFamily: 'var(--font-corps)' }}>
              Séance en direct →
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
            <span className="text-xs" style={{ fontFamily: 'var(--font-corps)' }}>Découvrir</span>
            <div className="w-px h-12 bg-white/30 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== CHIFFRES CLÉS ===== */}
      <section style={{ background: 'var(--pel-bleu)' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { valeur: '24', label: 'Parlementaires' },
              { valeur: '6', label: 'Groupes politiques' },
              { valeur: '8', label: 'Séances par mandat' },
              { valeur: '15', label: 'Textes débattus' },
            ].map((c, i) => (
              <div key={i}>
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1 }}>
                  {c.valeur}
                </p>
                <p className="text-blue-200 text-sm mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PEL EN BREF ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                Notre institution
              </p>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                LE PEL EN BREF
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8" style={{ fontFamily: 'var(--font-corps)' }}>
                {settings.pel_bref_texte}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8" style={{ fontFamily: 'var(--font-corps)' }}>
                Fondé sur le modèle des parlements nationaux, le PEL réunit des étudiants passionnés par la politique, le droit et les institutions. Chaque mandat, nos parlementaires débattent et votent des textes de loi dans les règles de l&apos;art.
              </p>
              <Link href="/presentation" className="btn-primary">
                En savoir plus →
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--pel-bleu-light)', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 400 250" className="w-full max-w-sm">
                  <path d="M 40 200 A 160 160 0 0 1 360 200" fill="none" stroke="#04439a" strokeWidth="3" opacity="0.3"/>
                  <path d="M 70 200 A 130 130 0 0 1 330 200" fill="none" stroke="#04439a" strokeWidth="2" opacity="0.2"/>
                  <path d="M 100 200 A 100 100 0 0 1 300 200" fill="none" stroke="#04439a" strokeWidth="2" opacity="0.2"/>
                  {Array.from({length: 24}, (_, i) => {
                    const row = Math.floor(i / 8)
                    const idx = i % 8
                    const r = 160 - row * 30
                    const angle = Math.PI + (idx / 7) * Math.PI
                    const x = 200 + r * Math.cos(angle)
                    const y = 200 + r * Math.sin(angle)
                    const colors = ['#b21d0b','#04439a','#059669','#d97706','#7c3aed','#ec4899']
                    return <circle key={i} cx={x} cy={y} r={8} fill={colors[Math.floor(i/4) % colors.length]} opacity={0.8} />
                  })}
                  <ellipse cx="200" cy="215" rx="30" ry="12" fill="#04439a"/>
                  <text x="200" y="219" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PRÉSIDENCE</text>
                </svg>
              </div>
              {/* Badge flottant */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>2024</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>Année de fondation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DERNIÈRES ACTUALITÉS ===== */}
      <section style={{ background: 'var(--pel-creme)' }} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>Fil de l&apos;actualité</p>
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--pel-bleu)', fontWeight: 700 }}>ACTUALITÉS</h2>
            </div>
            <Link href="/actualites" className="btn-outline hidden sm:inline-flex">Toutes les actualités</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { titre: 'Séance plénière du printemps 2026', categorie: 'Séance plénière', date: '10 juin 2026', extrait: 'Retour sur la séance plénière du deuxième semestre, marquée par le vote de trois textes de loi majeurs.' },
              { titre: 'Nouveaux parlementaires élus', categorie: 'Vie du PEL', date: '5 juin 2026', extrait: 'Le Parlement des Étudiants de Lyon accueille 6 nouveaux parlementaires pour le mandat 2025-2026.' },
              { titre: 'Partenariat avec Sciences Po Lyon', categorie: 'Partenariats', date: '1 juin 2026', extrait: 'Le PEL signe un accord de partenariat avec Sciences Po Lyon pour développer les simulations parlementaires.' },
            ].map((a, i) => (
              <article key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group border border-gray-100">
                <div className="h-40" style={{ background: 'var(--pel-bleu-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-titre)', fontSize: '3rem', color: 'var(--pel-bleu)', opacity: 0.3 }}>PEL</span>
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                    {a.categorie}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)', fontSize: '0.95rem' }}>
                    {a.titre}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-corps)' }}>{a.extrait}</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>{a.date}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link href="/actualites" className="btn-primary">Toutes les actualités</Link>
          </div>
        </div>
      </section>

      {/* ===== PROCHAINS ÉVÉNEMENTS ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>Calendrier</p>
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--pel-bleu)', fontWeight: 700 }}>PROCHAINS ÉVÉNEMENTS</h2>
            </div>
            <Link href="/agenda" className="btn-outline hidden sm:inline-flex">Voir l&apos;agenda</Link>
          </div>

          <div className="space-y-4">
            {[
              { jour: '15', mois: 'JUN', titre: 'Séance plénière — Printemps 2026', lieu: 'Amphi Lacassagne, Université Lyon 3', heure: '14h00', type: 'Séance' },
              { jour: '20', mois: 'JUN', titre: 'Réunion des présidents de groupe', lieu: 'Salle de réunion B201', heure: '18h00', type: 'Réunion' },
              { jour: '01', mois: 'JUL', titre: 'Cérémonie de remise des mandats', lieu: 'Grand amphithéâtre', heure: '17h00', type: 'Cérémonie' },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border border-gray-100 hover:border-[#04439a] hover:shadow-md transition-all group" style={{ background: 'var(--pel-creme)' }}>
                <div className="text-center flex-shrink-0 w-16">
                  <p style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1 }}>{e.jour}</p>
                  <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>{e.mois}</p>
                </div>
                <div className="w-px h-12 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-corps)' }}>{e.titre}</p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>{e.heure} · {e.lieu}</p>
                </div>
                <span className="badge flex-shrink-0 text-white" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{e.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{ background: 'var(--pel-bleu)' }} className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700 }}>
            REJOIGNEZ LE DÉBAT PARLEMENTAIRE
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corps)' }}>
            Une question, un partenariat ? Nous sommes à votre disposition pour toute demande d&apos;information.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded font-semibold bg-white hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
            Nous contacter <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
