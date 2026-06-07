import Link from 'next/link'
export const revalidate = 60

export default function ActualitesPage() {
  const articles = [
    { slug: 'seance-printemps-2026', titre: 'Séance plénière du printemps 2026', categorie: 'Séance plénière', date: '10 juin 2026', extrait: 'Retour sur la séance plénière du deuxième semestre.' },
    { slug: 'nouveaux-parlementaires-2026', titre: 'Nouveaux parlementaires élus', categorie: 'Vie du PEL', date: '5 juin 2026', extrait: 'Le PEL accueille 6 nouveaux parlementaires.' },
    { slug: 'partenariat-sciences-po', titre: 'Partenariat avec Sciences Po Lyon', categorie: 'Partenariats', date: '1 juin 2026', extrait: 'Accord de partenariat avec Sciences Po Lyon.' },
  ]

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Restez informé</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>ACTUALITÉS</h1>
        </div>
      </section>
      <section className="py-16" style={{ background: 'var(--pel-creme)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((a) => (
              <article key={a.slug} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group border border-gray-100">
                <div className="h-44 flex items-center justify-center" style={{ background: 'var(--pel-bleu-light)' }}>
                  <span style={{ fontFamily: 'var(--font-titre)', fontSize: '3rem', color: 'var(--pel-bleu)', opacity: 0.3 }}>PEL</span>
                </div>
                <div className="p-6">
                  <span className="badge text-white mb-3 inline-block" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{a.categorie}</span>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>{a.titre}</h3>
                  <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'var(--font-corps)' }}>{a.extrait}</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>{a.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
