import { getRessources } from '@/lib/cms'
import SiteHero from '@/components/site/SiteHero'
import { FileText, Download } from 'lucide-react'

export const revalidate = 60

export default async function RessourcesPage() {
  const docs = await getRessources()

  const categories = Array.from(new Set(docs.map((d: any) => d.categorie ?? 'Autres')))

  return (
    <div>
      <SiteHero
        badge="Documents officiels"
        title="Ressources"
        description="Textes fondateurs, règlements et documents officiels du Parlement des Étudiants de Lyon."
      />

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {docs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📄</p>
              <p className="text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>Aucun document disponible pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map(cat => (
                <div key={String(cat)}>
                  <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.8rem', color: 'var(--pel-bleu)', fontWeight: 700, textAlign: 'center' }}>{String(cat).toUpperCase()}</h2>
                  <div className="space-y-4">
                    {docs.filter((d: any) => (d.categorie ?? 'Autres') === cat).map((doc: any) => (
                      <div
                        key={doc.id}
                        className="glass-card rounded-xl p-6 flex items-start gap-4"
                      >
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pel-bleu-light)' }}>
                          <FileText size={20} style={{ color: 'var(--pel-bleu)' }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{doc.titre}</p>
                          {doc.description && <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{doc.description}</p>}
                          {doc.version && <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{doc.version}</p>}
                        </div>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="btn-primary flex-shrink-0 text-sm py-2 px-4 flex items-center gap-2">
                            <Download size={14} />
                            Télécharger
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
