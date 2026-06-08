import { getEvenements } from '@/lib/cms'
import Link from 'next/link'

export const revalidate = 60

const MOIS = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']

export default async function AgendaPage() {
  const evenements = await getEvenements()

  return (
    <div>
      <section
        style={{
          background: 'var(--pel-bleu)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="py-20"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="animate-orb" style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(60px)', top: '-80px', right: '10%' }} />
          <div className="animate-orb-reverse" style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)', bottom: '-60px', left: '5%' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Calendrier parlementaire</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 700 }}>AGENDA</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {evenements.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📅</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>AUCUN ÉVÉNEMENT PLANIFIÉ</p>
              <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les prochains événements seront affichés ici.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evenements.map((e: any) => {
                const d = new Date(e.date)
                const passe = d < new Date()
                return (
                  <div
                    key={e.id}
                    className={`flex items-center gap-6 p-6 rounded-2xl transition-all ${passe ? 'opacity-50' : ''}`}
                    style={{
                      background: 'rgba(255,255,255,0.55)',
                      backdropFilter: 'blur(20px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                      border: '1px solid rgba(255,255,255,0.75)',
                      boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                  >
                    <div className="text-center flex-shrink-0 w-16">
                      <p style={{ fontFamily: 'var(--font-titre)', fontSize: '2.2rem', color: passe ? 'var(--pel-gris)' : 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1 }}>{d.getDate().toString().padStart(2,'0')}</p>
                      <p className="text-xs font-bold tracking-widest" style={{ color: passe ? 'var(--pel-gris)' : 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>{MOIS[d.getMonth()]} {d.getFullYear()}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{e.titre}</p>
                      <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>
                        {e.heure ? e.heure.slice(0,5) + ' · ' : ''}{e.lieu ?? ''}
                      </p>
                      {e.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1" style={{ fontFamily: 'var(--font-corps)' }}>{e.description}</p>}
                    </div>
                    <span className="badge flex-shrink-0 text-white capitalize text-xs" style={{ background: passe ? 'var(--pel-gris)' : 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{e.type ?? 'Événement'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
