import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, Calendar, User, FileText, ArrowLeft, Tag, Hash } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import SiteHero from '@/components/site/SiteHero'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data } = await adminClient.from('bills').select('title, number').eq('id', params.id).single()
  if (!data) return { title: 'Texte adopté — PEL' }
  return { title: `${data.number} — ${data.title} | Journal officiel PEL` }
}

interface Bill {
  id: string
  number: string
  title: string
  description: string | null
  type: string | null
  status: string
  created_at: string
  updated_at: string
  profiles: { first_name: string; last_name: string } | null
  bill_cosignataires?: { profiles: { first_name: string; last_name: string } | null }[]
}

export default async function LoiPubliquePage({ params }: { params: { id: string } }) {
  const { data } = await adminClient
    .from('bills')
    .select('*, profiles(first_name, last_name), bill_cosignataires(profiles(first_name, last_name))')
    .eq('id', params.id)
    .eq('status', 'adoptee')
    .single()

  if (!data) notFound()

  const bill = data as unknown as Bill

  const typeLabel = bill.type === 'projet_de_loi' ? 'Projet de loi' : 'Proposition de loi'

  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteHero
        badge={bill.type ? typeLabel : 'Journal officiel'}
        title={bill.title}
        description={`${bill.number} · Adopté le ${formatDate(bill.updated_at)}`}
      >
        {/* Lien retour + badges dans le hero */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Link
            href="/journal-officiel"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '999px', padding: '0.35rem 1rem',
              fontFamily: 'var(--font-corps)', fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
            }}
          >
            <ArrowLeft size={12} />
            Retour au Journal officiel
          </Link>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: 'rgba(22,163,74,0.35)', border: '1px solid rgba(22,163,74,0.5)',
            borderRadius: '999px', padding: '0.35rem 1rem',
            fontFamily: 'var(--font-corps)', fontSize: '0.78rem', color: 'white',
          }}>
            <CheckCircle size={12} />
            Adopté
          </span>
        </div>
      </SiteHero>

      {/* Contenu */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Métadonnées */}
        <div style={{
          background: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb',
          padding: '1.25rem 1.75rem', marginBottom: '1.5rem',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          display: 'flex', flexWrap: 'wrap', gap: '1.25rem',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', color: '#6b7280' }}>
            <Hash size={14} style={{ color: '#9ca3af' }} />
            <strong style={{ color: '#374151' }}>{bill.number}</strong>
          </span>
          {bill.type && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', color: '#6b7280' }}>
              <Tag size={14} style={{ color: '#9ca3af' }} />
              {typeLabel}
            </span>
          )}
          {bill.profiles && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', color: '#6b7280' }}>
              <User size={14} style={{ color: '#9ca3af' }} />
              {bill.profiles.first_name} {bill.profiles.last_name}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', color: '#6b7280' }}>
            <Calendar size={14} style={{ color: '#9ca3af' }} />
            Déposé le {formatDate(bill.created_at)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.82rem', color: '#6b7280' }}>
            <CheckCircle size={14} style={{ color: '#16a34a' }} />
            Adopté le {formatDate(bill.updated_at)}
          </span>
        </div>

        {/* Exposé des motifs */}
        {bill.description && (
          <div style={{
            background: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb',
            padding: '1.75rem', marginBottom: '1.5rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-titre)', fontWeight: 800,
              fontSize: '1rem', color: '#04439a',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}>
              Exposé des motifs
            </h2>
            <p style={{
              fontFamily: 'var(--font-corps)', color: '#374151',
              lineHeight: 1.8, textAlign: 'justify', whiteSpace: 'pre-line',
            }}>
              {bill.description}
            </p>
          </div>
        )}

        {/* Signataires */}
        {bill.bill_cosignataires && bill.bill_cosignataires.length > 0 && (
          <div style={{
            background: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb',
            padding: '1.5rem', marginBottom: '1.5rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-titre)', fontWeight: 800,
              fontSize: '1rem', color: '#04439a',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '0.875rem',
            }}>
              Signataires
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {bill.profiles && (
                <span style={{
                  background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                  borderRadius: '999px', padding: '0.3rem 0.75rem',
                  fontFamily: 'var(--font-corps)', fontSize: '0.82rem', fontWeight: 500,
                }}>
                  {bill.profiles.first_name} {bill.profiles.last_name}
                </span>
              )}
              {bill.bill_cosignataires.map((cos, i) => cos.profiles && (
                <span key={i} style={{
                  background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb',
                  borderRadius: '999px', padding: '0.3rem 0.75rem',
                  fontFamily: 'var(--font-corps)', fontSize: '0.82rem', fontWeight: 500,
                }}>
                  {cos.profiles.first_name} {cos.profiles.last_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Retour */}
        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <Link
            href="/journal-officiel"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', border: '1.5px solid #e5e7eb',
              borderRadius: '0.75rem', fontFamily: 'var(--font-corps)',
              fontSize: '0.85rem', fontWeight: 600, color: '#04439a',
              textDecoration: 'none', background: 'white',
            }}
          >
            <ArrowLeft size={14} />
            Retour au Journal officiel
          </Link>
        </div>
      </div>
    </div>
  )
}
