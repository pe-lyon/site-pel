import SiteHero from '@/components/site/SiteHero'
import { Mail } from 'lucide-react'

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
            padding: 'clamp(2rem, 6vw, 3rem)',
            textAlign: 'center',
          }}>
            {/* Icône */}
            <div style={{
              width: 72, height: 72, borderRadius: '1.25rem',
              background: 'rgba(4,67,154,0.08)',
              border: '1px solid rgba(4,67,154,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <Mail size={32} style={{ color: 'var(--pel-bleu)' }} />
            </div>

            <h2 style={{
              fontFamily: 'var(--font-titre)', fontSize: '1.4rem', color: 'var(--pel-bleu)',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.75rem',
            }}>
              Newsletter — Prochainement
            </h2>

            <p style={{
              fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '1rem',
              lineHeight: 1.65, marginBottom: '2rem',
            }}>
              La newsletter du PEL sera bientôt disponible. Tu pourras t'abonner pour recevoir
              les actualités, les comptes-rendus de séances et les annonces importantes
              directement dans ta boîte mail.
            </p>

            {/* En attendant → contact email */}
            <a
              href="mailto:communication.pelyon@gmail.com?subject=Newsletter PEL — Inscription&body=Bonjour, je souhaite être informé·e des actualités du Parlement des Étudiants de Lyon."
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.875rem 1.75rem', borderRadius: '0.875rem',
                background: 'var(--pel-bleu)', color: 'white',
                fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
            >
              <Mail size={17} />
              M'inscrire par email
            </a>

            <p style={{
              fontFamily: 'var(--font-corps)', color: '#9ca3af', fontSize: '0.78rem',
              marginTop: '1rem',
            }}>
              En attendant, envoie-nous un email et nous t'ajouterons à la liste.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
