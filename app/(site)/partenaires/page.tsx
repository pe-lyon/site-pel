import { createClient } from '@supabase/supabase-js'
import SiteHero from '@/components/site/SiteHero'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Partenaires — Parlement des Étudiants de Lyon',
  description: 'Découvrez les partenaires du Parlement des Étudiants de Lyon.',
}

interface Partenaire {
  nom: string
  logo_url?: string
  lien?: string
  type?: string
}

const DEFAULT_PARTENAIRES: Partenaire[] = [
  { nom: 'Université Lyon 1', type: 'Université partenaire', lien: 'https://www.univ-lyon1.fr' },
  { nom: 'Université Lyon 2', type: 'Université partenaire', lien: 'https://www.univ-lyon2.fr' },
  { nom: 'Université Lyon 3', type: 'Université partenaire', lien: 'https://www.univ-lyon3.fr' },
  { nom: 'Sciences Po Lyon', type: 'Université partenaire', lien: 'https://www.sciencespo-lyon.fr' },
]

function Initiales({ nom }: { nom: string }) {
  const parts = nom.trim().split(' ')
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : nom.slice(0, 2).toUpperCase()
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'rgba(4,67,154,0.08)' }}
    >
      <span style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--pel-bleu)' }}>
        {initials}
      </span>
    </div>
  )
}

export default async function PartenairesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let partenaires: Partenaire[] = DEFAULT_PARTENAIRES

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'partenaires_json')
    .single()

  if (data?.value) {
    try {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
      if (Array.isArray(parsed) && parsed.length > 0) {
        partenaires = parsed
      }
    } catch {
      // keep defaults
    }
  }

  // Group by type
  const types = Array.from(new Set(partenaires.map(p => p.type ?? 'Partenaire')))

  return (
    <div>
      <SiteHero
        badge="Nos partenaires"
        title="Partenaires"
        description="Le Parlement des Étudiants de Lyon s'appuie sur un réseau d'établissements partenaires engagés pour la vie étudiante lyonnaise."
      />

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {types.map(type => (
            <div key={type}>
              <h2
                className="text-center mb-8"
                style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                {type}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {partenaires.filter(p => (p.type ?? 'Partenaire') === type).map(p => {
                  const card = (
                    <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-4 text-center h-full transition-transform hover:-translate-y-1" style={{ transition: 'transform 0.2s' }}>
                      {/* Logo ou initiales */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ border: '1px solid rgba(4,67,154,0.12)' }}>
                        {p.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo_url} alt={p.nom} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Initiales nom={p.nom} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>{p.nom}</p>
                        {p.type && (
                          <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-corps)', color: 'var(--pel-bleu)', opacity: 0.75 }}>{p.type}</p>
                        )}
                      </div>
                      {p.lien && (
                        <span className="text-xs mt-auto" style={{ fontFamily: 'var(--font-corps)', color: 'rgba(4,67,154,0.6)' }}>
                          Visiter le site →
                        </span>
                      )}
                    </div>
                  )
                  return p.lien ? (
                    <a key={p.nom} href={p.lien} target="_blank" rel="noreferrer noopener" className="block h-full" style={{ textDecoration: 'none' }}>
                      {card}
                    </a>
                  ) : (
                    <div key={p.nom}>{card}</div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
