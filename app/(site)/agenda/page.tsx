export const revalidate = 60

export default function AgendaPage() {
  const evenements = [
    { jour: '15', mois: 'JUN', annee: '2026', titre: 'Séance plénière — Printemps 2026', lieu: 'Amphi Lacassagne', heure: '14h00', type: 'Séance', passe: false },
    { jour: '20', mois: 'JUN', annee: '2026', titre: 'Réunion des présidents de groupe', lieu: 'Salle B201', heure: '18h00', type: 'Réunion', passe: false },
    { jour: '01', mois: 'JUL', annee: '2026', titre: 'Cérémonie de remise des mandats', lieu: 'Grand amphithéâtre', heure: '17h00', type: 'Cérémonie', passe: false },
  ]

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Calendrier parlementaire</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>AGENDA</h1>
        </div>
      </section>
      <section className="py-16" style={{ background: 'var(--pel-creme)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {evenements.map((e, i) => (
            <div key={i} className={`flex items-center gap-6 p-6 rounded-2xl border transition-all ${e.passe ? 'opacity-50 bg-white border-gray-100' : 'bg-white border-gray-100 hover:border-[#04439a] hover:shadow-md'}`}>
              <div className="text-center flex-shrink-0 w-16">
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '2.2rem', color: e.passe ? 'var(--pel-gris)' : 'var(--pel-bleu)', fontWeight: 700, lineHeight: 1 }}>{e.jour}</p>
                <p className="text-xs font-bold tracking-widest" style={{ color: e.passe ? 'var(--pel-gris)' : 'var(--pel-rouge)', fontFamily: 'var(--font-corps)' }}>{e.mois} {e.annee}</p>
              </div>
              <div className="w-px h-12 bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{e.titre}</p>
                <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{e.heure} · {e.lieu}</p>
              </div>
              <span className="badge text-white flex-shrink-0" style={{ background: e.passe ? 'var(--pel-gris)' : 'var(--pel-bleu)' }}>{e.type}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
