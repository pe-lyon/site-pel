import { Mail, Instagram } from 'lucide-react'
import SiteHero from '@/components/site/SiteHero'

export default function ContactPage() {
  return (
    <div>
      <SiteHero
        badge="Nous contacter"
        title="Contact"
        description="Une question ? Une suggestion ? N'hésite pas à nous écrire."
      />

      <section className="py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-bleu)',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '2rem', textAlign: 'center',
            }}>
              Nos coordonnées
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Email */}
              <a
                href="mailto:communication.pelyon@gmail.com"
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.25rem 1.5rem', borderRadius: '1rem',
                  background: 'rgba(4,67,154,0.05)', border: '1px solid rgba(4,67,154,0.12)',
                  textDecoration: 'none', transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(4,67,154,0.10)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(4,67,154,0.25)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(4,67,154,0.05)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(4,67,154,0.12)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '0.75rem', flexShrink: 0,
                  background: 'var(--pel-bleu)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mail size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: 'var(--pel-bleu)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Email</p>
                  <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.95rem', marginTop: '0.15rem' }}>communication.pelyon@gmail.com</p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/pel_lyon"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.25rem 1.5rem', borderRadius: '1rem',
                  background: 'rgba(131,58,180,0.05)', border: '1px solid rgba(131,58,180,0.15)',
                  textDecoration: 'none', transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(131,58,180,0.10)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,58,180,0.30)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(131,58,180,0.05)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,58,180,0.15)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '0.75rem', flexShrink: 0,
                  background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Instagram size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-titre)', fontWeight: 700, color: '#833ab4', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Instagram</p>
                  <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.95rem', marginTop: '0.15rem' }}>@pel_lyon</p>
                </div>
              </a>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
