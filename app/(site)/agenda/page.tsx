import { getEvenements } from '@/lib/cms'
import Link from 'next/link'

export const revalidate = 60

const MOIS = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']

export default async function AgendaPage() {
  const evenements = await getEvenements()

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Calendrier parlementaire</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 700 }}>AGENDA</h1>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--pel-creme)' }}>
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
                  <div key={e.id} className={`flex items-center gap-6 p-6 rounded-2xl border transition-all ${passe ? 'opacity-50 bg-white border-gray-100' : 'bg-white border-gray-100 hover:border-[#04439a] hover:shadow-md'}`}>
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
