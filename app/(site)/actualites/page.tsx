import { getActualites } from '@/lib/cms'

export const revalidate = 60

export default async function ActualitesPage() {
  const articles = await getActualites()

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Restez informé</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 700 }}>ACTUALITÉS</h1>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--pel-creme)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📰</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>AUCUNE ACTUALITÉ PUBLIÉE</p>
              <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les articles seront affichés ici dès leur publication.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {articles.map((a: any) => (
                <article key={a.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group border border-gray-100">
                  <div className="h-44 flex items-center justify-center" style={{ background: 'var(--pel-bleu-light)' }}>
                    <span style={{ fontFamily: 'var(--font-titre)', fontSize: '3rem', color: 'var(--pel-bleu)', opacity: 0.3 }}>PEL</span>
                  </div>
                  <div className="p-6">
                    {a.categorie && <span className="badge text-white mb-3 inline-block text-xs" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>{a.categorie}</span>}
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#04439a] transition-colors leading-snug" style={{ fontFamily: 'var(--font-corps)' }}>{a.titre}</h3>
                    {a.extrait && <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-3" style={{ fontFamily: 'var(--font-corps)' }}>{a.extrait}</p>}
                    {a.auteur && <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'var(--font-corps)' }}>Par {a.auteur}</p>}
                    {a.publie_le && <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>{new Date(a.publie_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
