import { getSettings, getTimeline } from '@/lib/cms'

export const revalidate = 60

export default async function PresentationPage() {
  const [settings, timeline] = await Promise.all([
    getSettings(['presentation_mission', 'presentation_valeurs']),
    getTimeline(),
  ])

  const missionText = settings['presentation_mission']
  const valeursText = settings['presentation_valeurs']

  // Valeurs par défaut si non configurées
  const defaultValeurs = [
    { emoji: '⚖️', titre: 'DÉMOCRATIE', texte: 'Tout parlementaire a une voix égale. Chaque vote compte autant que celui du voisin.' },
    { emoji: '🗣️', titre: 'DÉBAT', texte: "La confrontation d'idées, dans le respect mutuel, est le moteur de notre démocratie." },
    { emoji: '🤝', titre: 'COLLÉGIALITÉ', texte: "Nous avançons ensemble, dans l'intérêt de l'institution et de ses membres." },
  ]

  return (
    <div>
      {/* Bandeau */}
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Notre institution</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>PRÉSENTATION</h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8" style={{ fontFamily: 'var(--font-titre)', fontSize: '2.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>NOTRE MISSION</h2>
          {missionText ? (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" style={{ fontFamily: 'var(--font-corps)' }}>
              {missionText.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} className="mb-4">{p}</p>
              ))}
            </div>
          ) : (
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4" style={{ fontFamily: 'var(--font-corps)' }}>
              <p>Le Parlement des Étudiants de Lyon est une institution parlementaire étudiante fondée sur les principes de la démocratie représentative. Il réunit des étudiants de toutes disciplines pour débattre, voter et légiférer sur des propositions de loi, dans le respect des règles parlementaires.</p>
              <p>Notre objectif est de former les étudiants aux mécanismes de la démocratie, du débat parlementaire et de la vie politique institutionnelle, tout en développant leurs compétences oratoires, leur esprit critique et leur sens du collectif.</p>
              <p>Chaque séance plénière est l&apos;occasion pour les parlementaires de défendre leurs convictions, d&apos;écouter les arguments de l&apos;opposition et de voter des textes qui engagent l&apos;ensemble de l&apos;institution.</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: 'var(--pel-creme)' }} className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12" style={{ fontFamily: 'var(--font-titre)', fontSize: '2.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>NOTRE HISTOIRE</h2>
          {timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-8">
                {timeline.map((item: any, i: number) => (
                  <div key={item.id ?? i} className="flex items-start gap-6 pl-16 relative">
                    <div className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--pel-bleu)' }}>
                      {i + 1}
                    </div>
                    <div className="bg-white rounded-xl p-6 flex-1 border border-gray-100">
                      <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-rouge)', fontWeight: 700 }}>{item.annee}</p>
                      <p className="text-gray-600 mt-2" style={{ fontFamily: 'var(--font-corps)' }}>{item.texte ?? item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic" style={{ fontFamily: 'var(--font-corps)' }}>L&apos;histoire du PEL sera bientôt disponible.</p>
          )}
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center" style={{ fontFamily: 'var(--font-titre)', fontSize: '2.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>NOS VALEURS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {defaultValeurs.map((v, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-[#04439a] transition-colors">
                <p className="text-5xl mb-4">{v.emoji}</p>
                <h3 className="mb-3" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>{v.titre}</h3>
                <p className="text-gray-600" style={{ fontFamily: 'var(--font-corps)' }}>{v.texte}</p>
              </div>
            ))}
          </div>
          {valeursText && (
            <p className="mt-12 text-center text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-corps)' }}>{valeursText}</p>
          )}
        </div>
      </section>
    </div>
  )
}
