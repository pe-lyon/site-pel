import Link from 'next/link'
import Image from 'next/image'
import SiteHero from '@/components/site/SiteHero'
import { getSetting } from '@/lib/cms'
import { ExternalLink, Clock, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Rejoindre le PEL — Parlement des Étudiants de Lyon',
  description: 'Rejoins le Parlement des Étudiants de Lyon et participe à la vie parlementaire étudiante.',
}

export default async function RejoindreePage() {
  const helloassoUrl = await getSetting('rejoindre_helloasso_url')

  return (
    <div>
      <SiteHero
        badge="Nous rejoindre"
        title="Rejoindre le PEL"
        description="Tu es étudiant·e à Lyon et tu veux participer à la vie parlementaire ? Le PEL t'ouvre ses portes."
      />

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Carte principale */}
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(4,67,154,0.10)',
          }}>
            {/* Header bleu */}
            <div style={{
              background: 'linear-gradient(135deg, #04439a 0%, #1a5fc0 100%)',
              padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 5vw, 2.5rem)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
              <h2 style={{
                fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 800, color: 'white', textTransform: 'uppercase',
                letterSpacing: '0.04em', margin: 0,
              }}>
                Devenir Parlementaire
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '0.75rem', fontFamily: 'var(--font-corps)', fontSize: '1rem' }}>
                Rejoins une institution étudiante unique à Lyon
              </p>
            </div>

            {/* Corps */}
            <div style={{ padding: 'clamp(1.25rem, 5vw, 2.5rem)' }}>

              {/* Étapes */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
                  Comment ça marche ?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { num: '1', titre: 'Inscription en ligne', desc: 'Remplis le formulaire d\'adhésion via HelloAsso.' },
                    { num: '2', titre: 'Validation', desc: 'Le bureau étudie ta candidature et te confirme ton admission.' },
                    { num: '3', titre: 'Première séance', desc: 'Tu reçois toutes les informations pour participer à ta première séance plénière.' },
                  ].map(step => (
                    <div key={step.num} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--pel-bleu)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-titre)', fontWeight: 700, fontSize: '0.9rem',
                      }}>{step.num}</div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>{step.titre}</p>
                        <p style={{ fontFamily: 'var(--font-corps)', color: '#6b7280', fontSize: '0.875rem', marginTop: '0.2rem' }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA HelloAsso ou maintenance */}
              {helloassoUrl ? (
                <a
                  href={helloassoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    width: '100%', padding: '1rem 2rem', borderRadius: '999px',
                    background: 'var(--pel-bleu)', color: 'white',
                    fontFamily: 'var(--font-corps)', fontSize: '1rem', fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 20px rgba(4,67,154,0.30)',
                  }}
                >
                  <ExternalLink size={18} /> S'inscrire via HelloAsso
                </a>
              ) : (
                <div style={{
                  background: '#fef9c3', border: '1px solid #fde047',
                  borderRadius: '1rem', padding: '1.5rem', textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Clock size={20} style={{ color: '#ca8a04' }} />
                    <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#92400e', fontSize: '1rem', margin: 0 }}>
                      LIEN D'INSCRIPTION BIENTÔT DISPONIBLE
                    </p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-corps)', color: '#78350f', fontSize: '0.875rem', margin: 0 }}>
                    Le formulaire d'adhésion via HelloAsso sera disponible très prochainement. Reviens dans quelques jours ou contacte-nous directement.
                  </p>
                  <Link
                    href="/contact"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem',
                      padding: '0.6rem 1.25rem', borderRadius: '999px',
                      background: '#92400e', color: 'white',
                      fontFamily: 'var(--font-corps)', fontSize: '0.875rem', fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <Mail size={15} /> Nous contacter
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Retour accueil */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: 'var(--pel-bleu)', textDecoration: 'none' }}>
              ← Retour à l'accueil
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
