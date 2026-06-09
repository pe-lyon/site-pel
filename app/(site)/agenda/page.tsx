import { getEvenements } from '@/lib/cms'
import SiteHero from '@/components/site/SiteHero'
import AgendaCalendar from '@/components/site/AgendaCalendar'

export const revalidate = 60

export default async function AgendaPage() {
  const evenements = await getEvenements()

  return (
    <div>
      <SiteHero
        badge="Calendrier parlementaire"
        title="Agenda"
        description="Les séances, réunions et événements à venir du Parlement des Étudiants de Lyon."
      />

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
