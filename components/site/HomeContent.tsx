'use client'

import Link from 'next/link'

interface Props {
  settings: Record<string, string>
  evenements: any[]
  actualites: any[]
  chiffres: any[]
}

export default function HomeContent({ settings, evenements, actualites, chiffres }: Props) {
  const heroTitre = settings.hero_titre || 'PARLEMENT DES ÉTUDIANTS DE LYON'
  const heroSousTitre = settings.hero_sous_titre || "L'institution parlementaire étudiante de référence à Lyon"
  const pelBref = settings.pel_bref_texte || "Le Parlement des Étudiants de Lyon est une institution parlementaire étudiante fondée sur les principes de la démocratie représentative."

  return (
    <div>

      {/* ——————————————— HERO ——————————————— */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Photo de fond hero */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/photo-seance.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }} />
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(150deg, rgba(4,67,154,0.55) 0%, rgba(2,42,102,0.60) 55%, rgba(10,15,30,0.65) 100%)',
        }} />

        {/* Grille */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>

        {/* Orbs hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute animate-orb" style={{
            width: 700, height: 700, top: '-20%', right: '-12%',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            filter: 'blur(55px)',
            background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(99,102,241,0.20) 50%, transparent 75%)',
          }} />
          <div className="absolute animate-orb-reverse" style={{
            width: 550, height: 550, bottom: '-15%', left: '-10%',
            borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%',
            filter: 'blur(50px)',
            background: 'radial-gradient(circle, rgba(178,29,11,0.50) 0%, rgba(239,68,68,0.20) 50%, transparent 75%)',
          }} />
          <div className="absolute animate-float-slow" style={{
            width: 350, height: 350, top: '35%', left: '25%',
            borderRadius: '50%',
            filter: 'blur(60px)',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
          }} />
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-32 pb-24">

          <div className="animate-fade-in inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(16px)',
              fontFamily: 'var(--font-corps)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-white/90">Session 2026–2027 en cours</span>
          </div>

          <h1 className="animate-slide-up delay-100 mb-6" style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(2.8rem, 8vw, 7rem)',
            fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.01em',
            textShadow: '0 2px 40px rgba(0,0,0,0.4)',
          }}>
            {heroTitre}
          </h1>

          <p className="animate-slide-up delay-200 text-blue-200/90 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-corps)' }}>
            {heroSousTitre}
          </p>

<div className="animate-slide-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/presentation" className="hero-cta-rouge">
              Découvrir le PEL
            </Link>
            <Link href="/seance" className="hero-cta-glass">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Séance en direct
            </Link>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-35">
            <div className="w-5 h-8 border border-white/50 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————— CHIFFRES ——————————————— */}
      {chiffres.length > 0 && (
        <section className="py-20 relative">
          <div className="absolute inset-0" style={{ background: 'rgba(4,67,154,0.04)' }} />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {chiffres.map((c: any) => (
                <div key={c.id} className="chiffre-card group text-center p-7 rounded-3xl cursor-default">
                  <p style={{
                    fontFamily: 'var(--font-titre)',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 700, lineHeight: 1,
                    color: 'var(--pel-bleu)',
                  }}>{c.valeur}</p>
                  <p className="text-gray-500 text-sm mt-2" style={{ fontFamily: 'var(--font-corps)' }}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——————————————— PEL EN BREF ——————————————— */}
      <section className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: 'rgba(178,29,11,0.08)',
                  border: '1px solid rgba(178,29,11,0.15)',
                  color: 'var(--pel-rouge)',
                  fontFamily: 'var(--font-corps)',
                  backdropFilter: 'blur(8px)',
                }}>
                Notre institution
              </div>
              <h2 className="mb-6" style={{
                fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem,4vw,3.2rem)',
                color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1.05,
              }}>LE PEL EN BREF</h2>
              <p className="text-gray-600 leading-relaxed mb-8" style={{ fontFamily: 'var(--font-corps)', fontSize: '1.05rem' }}>
                {pelBref}
              </p>
              <Link href="/presentation" className="btn-primary">En savoir plus →</Link>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-visible flex items-center justify-center relative p-10"
                style={{
                  background: 'rgba(255,255,255,0.50)',
                  backdropFilter: 'blur(24px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  boxShadow: '0 24px 80px rgba(4,67,154,0.10), inset 0 1px 0 white',
                  minHeight: 340,
                }}>
                <svg viewBox="0 0 400 260" className="w-full max-w-sm">
                  <path d="M 40 210 A 160 160 0 0 1 360 210" fill="none" stroke="#04439a" strokeWidth="2" opacity="0.15"/>
                  <path d="M 70 210 A 130 130 0 0 1 330 210" fill="none" stroke="#04439a" strokeWidth="1.5" opacity="0.12"/>
                  <path d="M 100 210 A 100 100 0 0 1 300 210" fill="none" stroke="#04439a" strokeWidth="1.5" opacity="0.12"/>
                  {Array.from({length: 24}, (_, i) => {
                    const row = Math.floor(i/8); const idx = i%8
                    const r = 160 - row*30
                    const angle = Math.PI + (idx/7)*Math.PI
                    const x = 200 + r*Math.cos(angle); const y = 210 + r*Math.sin(angle)
                    const colors = ['#b21d0b','#04439a','#059669','#d97706','#7c3aed','#ec4899']
                    return <circle key={i} cx={x} cy={y} r={9} fill={colors[Math.floor(i/4)%colors.length]} opacity={0.85}/>
                  })}
                  <ellipse cx="200" cy="222" rx="32" ry="13" fill="#04439a"/>
                  <text x="200" y="226" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PRÉSIDENCE</text>
                </svg>
                <div className="absolute -bottom-5 -right-5 rounded-2xl px-5 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.80)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 32px rgba(4,67,154,0.12)',
                  }}>
                  <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.6rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>2024</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>Fondation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————— ACTUALITÉS ——————————————— */}
      {actualites.length > 0 && (
        <section className="py-24 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(4,67,154,0.03)' }} />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="pill mb-3" style={{
                  background: 'rgba(178,29,11,0.08)',
                  border: '1px solid rgba(178,29,11,0.14)',
                  color: 'var(--pel-rouge)',
                  fontFamily: 'var(--font-corps)',
                }}>Fil de l&apos;actualité</div>
                <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                  ACTUALITÉS
                </h2>
              </div>
              <Link href="/actualites" className="btn-outline hidden sm:inline-flex">Toutes →</Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {actualites.map((a: any) => (
                <article key={a.id} className="actu-card rounded-2xl overflow-hidden group">
                  <div className="h-44 flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(4,67,154,0.85) 0%, rgba(29,78,216,0.90) 100%)' }}>
                    <span style={{ fontFamily: 'var(--font-titre)', fontSize: '3.5rem', color: 'white', opacity: 0.12 }}>PEL</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'linear-gradient(135deg, rgba(178,29,11,0.35) 0%, transparent 70%)' }} />
                  </div>
                  <div className="p-6">
                    {a.categorie && (
                      <span className="pill mb-3" style={{
                        background: 'rgba(4,67,154,0.08)',
                        border: '1px solid rgba(4,67,154,0.12)',
                        color: 'var(--pel-bleu)',
                        fontFamily: 'var(--font-corps)',
                      }}>{a.categorie}</span>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#04439a] transition-colors"
                      style={{ fontFamily: 'var(--font-corps)', fontSize: '0.95rem' }}>
                      {a.titre}
                    </h3>
                    {a.extrait && (
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-corps)' }}>
                        {a.extrait}
                      </p>
                    )}
                    {a.publie_le && (
                      <p className="date-chip">
                        {new Date(a.publie_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——————————————— AGENDA ——————————————— */}
      {evenements.length > 0 && (
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="pill mb-3" style={{
                  background: 'rgba(4,67,154,0.06)',
                  border: '1px solid rgba(4,67,154,0.12)',
                  color: 'var(--pel-bleu)',
                  fontFamily: 'var(--font-corps)',
                }}>Calendrier</div>
                <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                  PROCHAINS ÉVÉNEMENTS
                </h2>
              </div>
              <Link href="/agenda" className="btn-outline hidden sm:inline-flex">Voir l&apos;agenda →</Link>
            </div>

            <div className="space-y-3">
              {evenements.map((e: any) => {
                const d = new Date(e.date)
                return (
                  <div key={e.id} className="event-card flex items-center gap-6 p-5 rounded-2xl cursor-default">
                    <div className="text-center flex-shrink-0 w-14">
                      <p style={{
                        fontFamily: 'var(--font-titre)',
                        fontSize: '2.2rem', color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1,
                      }}>{String(d.getDate()).padStart(2,'0')}</p>
                      <p className="text-xs font-bold tracking-widest mt-0.5"
                        style={{ color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                        {['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'][d.getMonth()]}
                      </p>
                    </div>
                    <div className="w-px h-10 flex-shrink-0" style={{ background: 'rgba(4,67,154,0.12)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>
                        {e.titre}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-corps)' }}>
                        {e.heure ? e.heure.slice(0,5) + ' · ' : ''}{e.lieu ?? ''}
                      </p>
                    </div>
                    {e.type && (
                      <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{
                          background: 'rgba(4,67,154,0.08)',
                          border: '1px solid rgba(4,67,154,0.12)',
                          color: 'var(--pel-bleu)',
                          fontFamily: 'var(--font-corps)',
                        }}>
                        {e.type}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ——————————————— CTA FINAL ——————————————— */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(150deg, rgba(4,67,154,0.96) 0%, rgba(2,42,102,0.97) 60%, rgba(10,15,30,0.98) 100%)',
        }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute animate-orb opacity-50" style={{
            width: 500, height: 500, top: '-30%', right: '-10%',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            filter: 'blur(60px)',
            background: 'radial-gradient(circle, rgba(178,29,11,0.40) 0%, transparent 70%)',
          }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4" style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700,
          }}>
            REJOIGNEZ LE DÉBAT PARLEMENTAIRE
          </h2>
          <p className="text-blue-200/80 text-lg mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corps)' }}>
            {settings.cta_texte || "Une question, un partenariat ? Nous sommes à votre disposition pour toute demande d'information."}
          </p>
          <Link href="/contact" className="cta-glass-btn">
            Nous contacter →
          </Link>
        </div>
      </section>
    </div>
  )
}
