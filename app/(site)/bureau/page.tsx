export const revalidate = 60

export default function BureauPage() {
  const membres = [
    { prenom: 'Marie', nom: 'Dupont', role: 'Présidente du Parlement' },
    { prenom: 'Thomas', nom: 'Martin', role: 'Vice-Président en charge des séances' },
    { prenom: 'Léa', nom: 'Bernard', role: 'Secrétaire Générale' },
  ]

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>L&apos;équipe dirigeante</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>LE BUREAU</h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {membres.map((m, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-titre)' }}>
                  {m.prenom[0]}{m.nom[0]}
                </div>
                <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.3rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>{m.prenom.toUpperCase()} {m.nom.toUpperCase()}</h3>
                <p className="text-gray-500 mt-1 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
