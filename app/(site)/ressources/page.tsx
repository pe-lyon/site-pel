import { FileText, Download } from 'lucide-react'
export const revalidate = 60

export default function RessourcesPage() {
  const docs = [
    { titre: 'Règlement intérieur du PEL', description: 'Document officiel régissant le fonctionnement du Parlement des Étudiants de Lyon.', categorie: 'Textes fondateurs', version: 'v2.1 — Juin 2026' },
    { titre: "Statuts de l'association", description: "Les statuts de l'association Parlement des Étudiants de Lyon.", categorie: 'Textes fondateurs', version: 'v1.3 — Janvier 2026' },
    { titre: 'Charte du parlementaire', description: 'Engagements et responsabilités de chaque membre du parlement.', categorie: 'Textes fondateurs', version: 'v1.0 — Octobre 2024' },
    { titre: 'Guide du groupe politique', description: 'Fonctionnement, droits et devoirs des groupes politiques.', categorie: 'Guides pratiques', version: 'v1.1 — Mars 2025' },
  ]

  const categories = [...new Set(docs.map(d => d.categorie))]

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Documents officiels</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>RESSOURCES</h1>
        </div>
      </section>
      <section className="py-16" style={{ background: 'var(--pel-creme)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.8rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>{cat.toUpperCase()}</h2>
              <div className="space-y-4">
                {docs.filter(d => d.categorie === cat).map((doc, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:border-[#04439a] hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pel-bleu-light)' }}>
                      <FileText size={20} style={{ color: 'var(--pel-bleu)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>{doc.titre}</p>
                      <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{doc.description}</p>
                      <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{doc.version}</p>
                    </div>
                    <button className="btn-primary flex-shrink-0 text-sm py-2 px-4 flex items-center gap-2">
                      <Download size={14} />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
