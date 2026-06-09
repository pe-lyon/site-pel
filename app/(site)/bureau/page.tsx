'use client'

import { useState, useEffect } from 'react'
import SiteHero from '@/components/site/SiteHero'
import { getInitials } from '@/lib/utils'
import { Mail, Linkedin, GraduationCap, MapPin, X, Calendar } from 'lucide-react'

function parseRole(role: string) {
  const parts = role.split(' > ')
  return parts.length >= 2
    ? { section: parts[0].trim(), fonction: parts.slice(1).join(' > ').trim() }
    : { section: '', fonction: role }
}

export default function BureauPage() {
  const [membres, setMembres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/public/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'bureau_membres', select: '*', order: { col: 'ordre' } }),
    })
      .then(r => r.json())
      .then(d => { setMembres(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const grouped: Record<string, any[]> = {}
  for (const m of membres) {
    const { section } = parseRole(m.role ?? '')
    const key = section || '__sans_section__'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }
  const sections = Object.keys(grouped).sort((a, b) => {
    if (a === '__sans_section__') return 1
    if (b === '__sans_section__') return -1
    return a.localeCompare(b)
  })

  return (
    <div>
      <SiteHero
        badge="L'équipe dirigeante"
        title="Le Bureau"
        description="Les membres élus qui dirigent le Parlement des Étudiants de Lyon."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-[#04439a] rounded-full animate-spin" />
            </div>
          ) : membres.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👥</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>BUREAU EN COURS DE CONSTITUTION</p>
              <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les membres du bureau seront affichés ici.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {sections.map(sec => (
                <div key={sec}>
                  {sec !== '__sans_section__' && (
                    <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)', fontWeight: 700, marginBottom: '2rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(4,67,154,0.15)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {sec}
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {grouped[sec].map((m: any) => {
                      const { fonction } = parseRole(m.role ?? '')
                      const hasExtra = m.bio || m.formation || m.universite || m.promotion
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelected(m)}
                          className="glass-card rounded-2xl p-6 text-center group transition-all hover:scale-[1.02] hover:shadow-xl w-full"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-titre)' }}>
                            {m.photo_url
                              ? <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} className="w-full h-full object-cover" />
                              : getInitials(m.prenom, m.nom)
                            }
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', color: 'var(--pel-bleu)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
                            {m.prenom} {m.nom}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)', textAlign: 'center' }}>{fonction}</p>
                          {m.formation && (
                            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1" style={{ fontFamily: 'var(--font-corps)' }}>
                              <GraduationCap size={11} /> {m.formation}
                            </p>
                          )}
                          {m.universite && (
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-0.5" style={{ fontFamily: 'var(--font-corps)' }}>
                              <MapPin size={11} /> {m.universite}
                            </p>
                          )}
                          <div className="flex justify-center gap-2 mt-4">
                            {m.email && (
                              <span onClick={e => { e.stopPropagation(); window.location.href = `mailto:${m.email}` }} className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-[#04439a] cursor-pointer">
                                <Mail size={15} />
                              </span>
                            )}
                            {m.linkedin_url && (
                              <span onClick={e => { e.stopPropagation(); window.open(m.linkedin_url, '_blank') }} className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-[#04439a] cursor-pointer">
                                <Linkedin size={15} />
                              </span>
                            )}
                          </div>
                          {hasExtra && (
                            <p className="text-xs text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                              Voir la fiche →
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal fiche détaillée */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="relative p-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #04439a 0%, #1a5fc0 100%)' }}>
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/30 flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {selected.photo_url
                  ? <img src={selected.photo_url} alt={`${selected.prenom} ${selected.nom}`} className="w-full h-full object-cover" />
                  : getInitials(selected.prenom, selected.nom)
                }
              </div>
              <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {selected.prenom} {selected.nom}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginTop: '0.25rem', fontFamily: 'var(--font-corps)' }}>
                {parseRole(selected.role ?? '').fonction}
              </p>
              {parseRole(selected.role ?? '').section && (
                <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-corps)' }}>
                  {parseRole(selected.role ?? '').section}
                </span>
              )}
            </div>

            {/* Corps */}
            <div className="p-6 space-y-5">
              {selected.bio && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">À propos</p>
                  <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.9rem', lineHeight: 1.7 }}>{selected.bio}</p>
                </div>
              )}
              {(selected.formation || selected.universite || selected.promotion) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Formation</p>
                  <div className="space-y-2">
                    {selected.formation && (
                      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-corps)', color: '#374151' }}>
                        <GraduationCap size={16} style={{ color: 'var(--pel-bleu)', flexShrink: 0 }} />
                        {selected.formation}
                      </div>
                    )}
                    {selected.universite && (
                      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-corps)', color: '#374151' }}>
                        <MapPin size={16} style={{ color: 'var(--pel-bleu)', flexShrink: 0 }} />
                        {selected.universite}
                      </div>
                    )}
                    {selected.promotion && (
                      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-corps)', color: '#374151' }}>
                        <Calendar size={16} style={{ color: 'var(--pel-bleu)', flexShrink: 0 }} />
                        {selected.promotion}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(selected.email || selected.linkedin_url) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contact</p>
                  <div className="flex flex-wrap gap-3">
                    {selected.email && (
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: '#f0f4ff', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                        <Mail size={15} /> {selected.email}
                      </a>
                    )}
                    {selected.linkedin_url && (
                      <a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: '#f0f4ff', color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
                        <Linkedin size={15} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
              {!selected.bio && !selected.formation && !selected.universite && !selected.promotion && !selected.email && !selected.linkedin_url && (
                <p className="text-center text-gray-400 py-4 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>
                  Aucune information complémentaire renseignée.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
