import Link from 'next/link'
import { getSettings, getEvenements, getActualites, getChiffresCles } from '@/lib/cms'

export const revalidate = 60

export default async function HomePage() {
  const [settings, evenements, actualites, chiffres] = await Promise.all([
    getSettings(['hero_titre', 'hero_sous_titre', 'pel_bref_texte', 'cta_texte']),
    getEvenements(3),
    getActualites(3),
    getChiffresCles(),
  ])

  const heroTitre = settings.hero_titre || 'PARLEMENT DES ÉTUDIANTS DE LYON'
  const heroSousTitre = settings.hero_sous_titre || "L'institution parlementaire étudiante de référence à Lyon"
  const pelBref = settings.pel_bref_texte || "Le Parlement des Étudiants de Lyon est une institution parlementaire étudiante fondée sur les principes de la démocratie représentative."
  const moisFR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']

  return (
    <div>

      {/* ——————————————— HERO ——————————————— */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Fond dégradé */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(150deg, #04439a 0%, #022a66 55%, #0a0f1e 100%)',
        }} />

        {/* Orbs animés */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb animate-orb absolute" style={{
            width: 600, height: 600,
            top: '-15%', right: '-10%',
            background: 'radial-gradient(circle, rgba(4,67,154,0.6) 0%, rgba(37,99,235,0.2) 60%, transparent 80%)',
          }} />
          <div className="orb animate-orb-reverse absolute" style={{
            width: 500, height: 500,
            bottom: '-20%', left: '-8%',
            background: 'radial-gradient(circle, rgba(178,29,11,0.35) 0%, rgba(220,38,38,0.12) 60%, transparent 80%)',
          }} />
          <div className="orb animate-float-slow absolute" style={{
            width: 300, height: 300,
            top: '30%', left: '20%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }} />
        </div>

        {/* Grille subtile */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>

        {/* Contenu */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-24">

          {/* Badge live */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.20)',
              backdropFilter: 'blur(12px)',
              fontFamily: 'var(--font-corps)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/90">Session 2025–2026 en cours</span>
          </div>

          {/* Titre */}
          <h1 className="animate-slide-up delay-100 mb-6" style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(2.8rem, 8vw, 7rem)',
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 40px rgba(0,0,0,0.3)',
          }}>
            {heroTitre}
          </h1>

          {/* Sous-titre */}
          <p className="animate-slide-up delay-200 text-blue-200 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-corps)' }}>
            {heroSousTitre}
          </p>

          {/* CTA */}
          <div className="animate-slide-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/presentation"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base text-white"
              style={{
                background: 'var(--pel-rouge)',
                boxShadow: '0 4px 20px rgba(178,29,11,0.45)',
                fontFamily: 'var(--font-corps)',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(178,29,11,0.55)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(178,29,11,0.45)' }}
            >
              Découvrir le PEL
            </Link>
            <Link href="/seance"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(12px)',
                color: 'white',
                fontFamily: 'var(--font-corps)',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Séance en direct
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <div className="w-5 h-8 border border-white/50 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————— CHIFFRES ——————————————— */}
      {chiffres.length > 0 && (
        <section className="py-16 relative overflow-hidden" style={{ background: 'var(--pel-bleu)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="orb animate-orb absolute opacity-30" style={{
              width: 400, height: 400, top: '-50%', right: '10%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {chiffres.map((c: any, i: number) => (
                <div key={c.id}
                  className="group p-6 rounded-2xl cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
                    animationDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)' }}
                >
                  <p className="text-white" style={{
                    fontFamily: 'var(--font-titre)',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 700, lineHeight: 1,
                  }}>{c.valeur}</p>
                  <p className="text-blue-200 text-sm mt-2" style={{ fontFamily: 'var(--font-corps)' }}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——————————————— PEL EN BREF ——————————————— */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" style={{
          background: 'radial-gradient(circle at top right, rgba(4,67,154,0.05) 0%, transparent 70%)',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(178,29,11,0.08)', color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                Notre institution
              </div>
              <h2 className="mb-6" style={{
                fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem,4vw,3.2rem)',
                color: 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1.05,
              }}>LE PEL EN BREF</h2>
              <p className="text-gray-500 leading-relaxed mb-8" style={{ fontFamily: 'var(--font-corps)', fontSize: '1.05rem' }}>
                {pelBref}
              </p>
              <Link href="/presentation" className="btn-primary">En savoir plus →</Link>
            </div>

            {/* Hémicycle décoratif */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, var(--pel-bleu-light) 0%, #dbeafe 100%)',
                  minHeight: 340,
                  boxShadow: '0 24px 80px rgba(4,67,154,0.12)',
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
                {/* Badge année */}
                <div className="absolute -bottom-4 -right-4 glass rounded-2xl px-5 py-3 shadow-xl">
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
        <section className="py-24 relative" style={{ background: 'var(--pel-creme)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(178,29,11,0.08)', color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>
                  Fil de l&apos;actualité
                </div>
                <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--pel-bleu)', fontWeight: 700 }}>
                  ACTUALITÉS
                </h2>
              </div>
              <Link href="/actualites" className="btn-outline hidden sm:inline-flex">Toutes →</Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {actualites.map((a: any, i: number) => (
                <article key={a.id} className="glass-card rounded-2xl overflow-hidden group" style={{ animationDelay: `${i*100}ms` }}>
                  <div className="h-44 flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, var(--pel-bleu) 0%, #1d4ed8 100%)' }}>
                    <span style={{ fontFamily: 'var(--font-titre)', fontSize: '3.5rem', color: 'white', opacity: 0.15, letterSpacing: '-0.02em' }}>PEL</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'linear-gradient(135deg, rgba(178,29,11,0.4) 0%, transparent 70%)' }} />
                  </div>
                  <div className="p-6">
                    {a.categorie && (
                      <span className="pill mb-3" style={{
                        background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)',
                        fontFamily: 'var(--font-corps)',
                      }}>{a.categorie}</span>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#04439a] transition-colors duration-200"
                      style={{ fontFamily: 'var(--font-corps)', fontSize: '0.95rem' }}>
                      {a.titre}
                    </h3>
                    {a.extrait && (
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-corps)' }}>
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
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none" style={{
            background: 'radial-gradient(circle at bottom left, rgba(4,67,154,0.04) 0%, transparent 70%)',
          }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(4,67,154,0.06)', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                  Calendrier
                </div>
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
                  <div key={e.id}
                    className="flex items-center gap-6 p-5 rounded-2xl group cursor-default"
                    style={{
                      background: 'var(--pel-creme)',
                      border: '1px solid transparent',
                      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onMouseEnter={ev => {
                      (ev.currentTarget as HTMLElement).style.transform = 'translateX(8px)'
                      ;(ev.currentTarget as HTMLElement).style.background = 'white'
                      ;(ev.currentTarget as HTMLElement).style.borderColor = 'rgba(4,67,154,0.15)'
                      ;(ev.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(4,67,154,0.08)'
                    }}
                    onMouseLeave={ev => {
                      (ev.currentTarget as HTMLElement).style.transform = ''
                      ;(ev.currentTarget as HTMLElement).style.background = 'var(--pel-creme)'
                      ;(ev.currentTarget as HTMLElement).style.borderColor = 'transparent'
                      ;(ev.currentTarget as HTMLElement).style.boxShadow = ''
                    }}
                  >
                    {/* Date block */}
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
                      <p className="font-semibold text-gray-900 group-hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>
                        {e.titre}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-corps)' }}>
                        {e.heure ? e.heure.slice(0,5) + ' · ' : ''}{e.lieu ?? ''}
                      </p>
                    </div>
                    {e.type && (
                      <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
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
      <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #04439a 0%, #022a66 60%, #0a0f1e 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb animate-orb absolute opacity-40" style={{
            width: 500, height: 500, top: '-30%', right: '-10%',
            background: 'radial-gradient(circle, rgba(178,29,11,0.3) 0%, transparent 70%)',
          }} />
          <div className="orb animate-float-slow absolute opacity-20" style={{
            width: 300, height: 300, bottom: '-20%', left: '5%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4" style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700,
            textShadow: '0 2px 30px rgba(0,0,0,0.3)',
          }}>
            REJOIGNEZ LE DÉBAT PARLEMENTAIRE
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corps)' }}>
            {settings.cta_texte || "Une question, un partenariat ? Nous sommes à votre disposition pour toute demande d'information."}
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-white hover:bg-gray-50 transition-all"
            style={{
              color: 'var(--pel-rouge)', fontFamily: 'var(--font-corps)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)' }}
          >
            Nous contacter →
          </Link>
        </div>
      </section>
    </div>
  )
}
