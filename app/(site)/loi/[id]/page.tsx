import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, CheckCircle, Calendar, User, FileText, ArrowLeft, Tag, Hash } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--site-bg, #f8f9fc)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #04439a 0%, #0a2d6e 100%)',
        padding: '4rem 1.5rem 3rem',
        color: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link
            href="/journal-officiel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'var(--font-corps)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft size={14} />
            Journal officiel
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '999px', padding: '0.3rem 0.8rem',
              fontFamily: 'var(--font-corps)', fontSize: '0.78rem',
            }}>
              <BookOpen size={12} />
              Journal officiel
            </span>
            {bill.type && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '999px', padding: '0.3rem 0.8rem',
                fontFamily: 'var(--font-corps)', fontSize: '0.78rem',
              }}>
                <Tag size={12} />
                {bill.type === 'projet_de_loi' ? 'Projet de loi' : 'Proposition de loi'}
              </span>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(22,163,74,0.35)', border: '1px solid rgba(22,163,74,0.5)',
              borderRadius: '999px', padding: '0.3rem 0.8rem',
              fontFamily: 'var(--font-corps)', fontSize: '0.78rem',
            }}>
              <CheckCircle size={12} />
              Adopté
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Hash size={14} style={{ opacity: 0.6 }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', opacity: 0.75 }}>{bill.number}</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-titre)',
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '1.5rem',
          }}>
            {bill.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.82rem', opacity: 0.8, fontFamily: 'var(--font-corps)' }}>
            {bill.profiles && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} />
                Déposé par {bill.profiles.first_name} {bill.profiles.last_name}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} />
              Adopté le {formatDate(bill.updated_at)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} />
              Déposé le {formatDate(bill.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Exposé des motifs / description */}
        {bill.description && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
            padding: '1.75rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
              Exposé des motifs
            </h2>
            <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {bill.description}
            </p>
          </div>
        )}

        {/* Cosignataires */}
        {bill.bill_cosignataires && bill.bill_cosignataires.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
              Signataires
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {bill.profiles && (
                <span style={{
                  background: '#eff6ff', color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: '999px', padding: '0.3rem 0.75rem',
                  fontFamily: 'var(--font-corps)', fontSize: '0.82rem', fontWeight: 500,
                }}>
                  {bill.profiles.first_name} {bill.profiles.last_name}
                </span>
              )}
              {bill.bill_cosignataires.map((cos, i) => cos.profiles && (
                <span key={i} style={{
                  background: '#f9fafb', color: '#374151',
                  border: '1px solid #e5e7eb',
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
              padding: '0.625rem 1.25rem',
              border: '1.5px solid #e5e7eb',
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-corps)', fontSize: '0.85rem', fontWeight: 600,
              color: '#04439a', textDecoration: 'none',
              background: 'white',
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
