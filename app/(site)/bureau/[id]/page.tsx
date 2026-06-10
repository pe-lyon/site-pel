import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Mail, Linkedin, GraduationCap, MapPin, Calendar, ArrowLeft } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function parseRole(role: string) {
  const parts = role.split(' > ')
  return parts.length >= 2
    ? { section: parts[0].trim(), fonction: parts.slice(1).join(' > ').trim() }
    : { section: '', fonction: role }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: m } = await adminClient.from('bureau_membres').select('prenom, nom, role').eq('id', id).single()
  if (!m) return { title: 'Membre introuvable' }
  return {
    title: `${m.prenom} ${m.nom} — Bureau du PEL`,
    description: `Fiche de ${m.prenom} ${m.nom}, ${parseRole(m.role ?? '').fonction} au Parlement des Étudiants de Lyon.`,
  }
}

export default async function MembrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: m } = await adminClient
    .from('bureau_membres')
    .select('*')
    .eq('id', id)
    .eq('actif', true)
    .single()

  if (!m) notFound()

  const { section, fonction } = parseRole(m.role ?? '')

  // Autres membres du même bureau pour navigation
  const { data: autresMembres } = await adminClient
    .from('bureau_membres')
    .select('id, prenom, nom, role, photo_url')
    .eq('actif', true)
    .neq('id', id)
    .order('ordre', { ascending: true })
    .limit(6)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8effc 100%)' }}>

      {/* Retour */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <Link
          href="/bureau"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}
        >
          <ArrowLeft size={16} /> Retour au bureau
        </Link>
      </div>

      {/* Fiche principale */}
      <div style={{ maxWidth: '860px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(4,67,154,0.10)',
        }}>
          {/* En-tête colorée */}
          <div style={{
            background: 'linear-gradient(135deg, #04439a 0%, #1a5fc0 100%)',
            padding: '3rem 2.5rem 2rem',
            display: 'flex', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap',
          }}>
            {/* Photo / Avatar */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: '4px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '2rem', fontWeight: 800,
              fontFamily: 'var(--font-titre)',
            }}>
              {m.photo_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(m.prenom, m.nom)
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {section && (
                <span style={{
                  display: 'inline-block', marginBottom: '0.5rem',
                  padding: '0.2rem 0.75rem', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.75rem', fontFamily: 'var(--font-corps)',
                }}>
                  {section}
                </span>
              )}
              <h1 style={{
                fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                fontWeight: 800, color: 'white', textTransform: 'uppercase',
                letterSpacing: '0.03em', lineHeight: 1.1, margin: 0,
              }}>
                {m.prenom} {m.nom}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginTop: '0.4rem', fontFamily: 'var(--font-corps)' }}>
                {fonction}
              </p>
            </div>
          </div>

          {/* Corps */}
          <div style={{ padding: '2rem 2.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

            {/* Bio */}
            {m.bio && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                  À propos
                </h2>
                <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', lineHeight: 1.75, fontSize: '0.95rem' }}>{m.bio}</p>
              </div>
            )}

            {/* Formation */}
            {(m.formation || m.universite || m.promotion) && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                  Formation
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {m.formation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.95rem' }}>
                      <GraduationCap size={18} style={{ color: 'var(--pel-bleu)', flexShrink: 0 }} />
                      {m.formation}
                    </div>
                  )}
                  {m.universite && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.95rem' }}>
                      <MapPin size={18} style={{ color: 'var(--pel-bleu)', flexShrink: 0 }} />
                      {m.universite}
                    </div>
                  )}
                  {m.promotion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.95rem' }}>
                      <Calendar size={18} style={{ color: 'var(--pel-bleu)', flexShrink: 0 }} />
                      {m.promotion}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact */}
            {(m.email || m.linkedin_url) && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                  Contact
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {m.email && (
                    <a href={`mailto:${m.email}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                      background: '#f0f4ff', color: 'var(--pel-bleu)',
                      fontFamily: 'var(--font-corps)', fontSize: '0.875rem', fontWeight: 600,
                      textDecoration: 'none',
                    }}>
                      <Mail size={16} /> {m.email}
                    </a>
                  )}
                  {m.linkedin_url && (
                    <a href={m.linkedin_url} target="_blank" rel="noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
                      background: '#f0f4ff', color: 'var(--pel-bleu)',
                      fontFamily: 'var(--font-corps)', fontSize: '0.875rem', fontWeight: 600,
                      textDecoration: 'none',
                    }}>
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Autres membres */}
        {autresMembres && autresMembres.length > 0 && (
          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Autres membres du bureau
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
              {autresMembres.map((autre: any) => {
                const { fonction: f } = parseRole(autre.role ?? '')
                return (
                  <Link key={autre.id} href={`/bureau/${autre.id}`} style={{ textDecoration: 'none' }}>
                    <div className="hover:-translate-y-0.5 hover:shadow-lg transition-all" style={{
                      background: 'white', borderRadius: '1rem', padding: '1rem',
                      textAlign: 'center', boxShadow: '0 2px 12px rgba(4,67,154,0.07)',
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', margin: '0 auto 0.5rem',
                        background: 'var(--pel-bleu)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem',
                        overflow: 'hidden',
                      }}>
                        {autre.photo_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={autre.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : getInitials(autre.prenom, autre.nom)
                        }
                      </div>
                      <p style={{ fontFamily: 'var(--font-titre)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', margin: 0 }}>
                        {autre.prenom} {autre.nom}
                      </p>
                      <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.2rem' }}>{f}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '3rem' }}>
          <Link href="/bureau" style={{ fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: 'var(--pel-bleu)', textDecoration: 'none' }}>
            ← Voir tous les membres du bureau
          </Link>
        </div>
      </div>
    </div>
  )
}
