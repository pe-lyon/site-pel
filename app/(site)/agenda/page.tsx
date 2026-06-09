import { getEvenements } from '@/lib/cms'
import AgendaCalendar from '@/components/site/AgendaCalendar'

export const revalidate = 60

export default async function AgendaPage() {
  const evenements = await getEvenements()

  return (
    <div>
      <section
        style={{
          background: 'var(--pel-bleu)',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '-1px',
        }}
        className="pt-28 pb-20"
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

      <section className="py-12">
        {evenements.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📅</p>
            <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>AUCUN ÉVÉNEMENT PLANIFIÉ</p>
            <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les prochains événements seront affichés ici.</p>
          </div>
        ) : (
          <AgendaCalendar evenements={evenements} />
        )}
      </section>
    </div>
  )
}
