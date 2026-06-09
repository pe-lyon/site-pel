import { getActualites } from '@/lib/cms'
import SiteHero from '@/components/site/SiteHero'

export const revalidate = 60

export default async function ActualitesPage() {
  const articles = await getActualites()

  return (
    <div>
      <SiteHero
        badge="Restez informé"
        title="Actualités"
        description="Les dernières nouvelles et publications du Parlement des Étudiants de Lyon."
      />

      <section className="py-16">
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
                <article
                  key={a.id}
                  className="glass-card rounded-2xl overflow-hidden group"
                >
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
