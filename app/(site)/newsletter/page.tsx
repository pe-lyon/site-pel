import SiteHero from '@/components/site/SiteHero'
import NewsletterForm from '@/components/site/NewsletterForm'

export default function NewsletterPage() {
  return (
    <div>
      <SiteHero
        badge="Newsletter"
        title="Restez informé·e"
        description="Recevez les actualités du Parlement des Étudiants de Lyon directement dans votre boîte mail."
      />

      <section className="py-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            borderRadius: '1.5rem',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.5rem', textAlign: 'center',
            }}>
              S'abonner à la newsletter
            </h2>
            <p style={{
              fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '0.9rem',
              textAlign: 'center', marginBottom: '1.5rem',
            }}>
              Nouveaux articles, comptes-rendus de séances, annonces importantes.
            </p>

            <NewsletterForm />

            {/* Avantages */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { emoji: '📰', label: 'Actualités en avant-première' },
                { emoji: '📋', label: 'Comptes-rendus de séances' },
                { emoji: '📅', label: 'Agenda des événements à venir' },
              ].map(item => (
                <div key={item.emoji} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  background: 'rgba(4,67,154,0.04)', border: '1px solid rgba(4,67,154,0.08)',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
