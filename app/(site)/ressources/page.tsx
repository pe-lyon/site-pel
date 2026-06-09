import { getRessources } from '@/lib/cms'
import { FileText, Download } from 'lucide-react'

export const revalidate = 60

export default async function RessourcesPage() {
  const docs = await getRessources()

  const categories = [...new Set(docs.map((d: any) => d.categorie ?? 'Autres'))]

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
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Documents officiels</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>RESSOURCES</h1>
        </div>
      </section>

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
                  <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.8rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>{String(cat).toUpperCase()}</h2>
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
