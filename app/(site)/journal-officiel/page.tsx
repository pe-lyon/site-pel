import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'

const adminClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
import { BookOpen, CheckCircle, Calendar, User, FileText, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Journal officiel — Parlement des Étudiants de Lyon',
  description: 'Textes adoptés par le Parlement des Étudiants de Lyon.',
}

interface Bill {
  id: string
  number: string
  title: string
  description: string | null
  type: string | null
  created_at: string
  updated_at: string
  profiles: { first_name: string; last_name: string } | null
}

export default async function JournalOfficielPage() {
  const { data: bills } = await adminClient
    .from('bills')
    .select('id, number, title, description, type, created_at, updated_at, profiles(first_name, last_name)')
    .eq('status', 'adoptee')
    .order('updated_at', { ascending: false })

  const adoptedBills = (bills ?? []) as unknown as Bill[]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--site-bg, #f8f9fc)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #04439a 0%, #0a2d6e 100%)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '0.4rem 1rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-corps)',
            marginBottom: '1.5rem',
          }}>
            <BookOpen size={14} />
            Journal officiel
          </div>
          <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
            Textes adoptés
          </h1>
          <p style={{ fontFamily: 'var(--font-corps)', fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.6 }}>
            Ensemble des propositions et projets de loi adoptés par le Parlement des Étudiants de Lyon.
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {adoptedBills.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '1.25rem',
            border: '1px solid #e5e7eb',
          }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
            <h3 style={{ fontFamily: 'var(--font-corps)', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>
              Aucun texte adopté pour l&apos;instant
            </h3>
            <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.9rem', color: '#9ca3af' }}>
              Les textes adoptés par le Parlement apparaîtront ici.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {adoptedBills.map((bill, i) => (
              <div
                key={bill.id}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}
              >
                {/* Numéro d'ordre */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#04439a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: 'var(--font-corps)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}>
                  {adoptedBills.length - i}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#9ca3af' }}>
                      {bill.number}
                    </span>
                    {bill.type && (
                      <span style={{
                        fontFamily: 'var(--font-corps)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#eef2ff',
                        color: '#4338ca',
                        borderRadius: '999px',
                        padding: '0.15rem 0.6rem',
                      }}>
                        {bill.type === 'projet_de_loi' ? 'Projet de loi' : 'Proposition de loi'}
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'var(--font-corps)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: '#dcfce7',
                      color: '#16a34a',
                      borderRadius: '999px',
                      padding: '0.15rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      <CheckCircle size={10} />
                      Adopté
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-corps)', fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                    {bill.title}
                  </h3>

                  {bill.description && (
                    <p style={{ fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {bill.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'var(--font-corps)' }}>
                    {bill.profiles && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={12} />
                        {bill.profiles.first_name} {bill.profiles.last_name}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} />
                      Adopté le {formatDate(bill.updated_at)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/loi/${bill.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '0.625rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-corps)',
                    color: '#04439a',
                    textDecoration: 'none',
                    flexShrink: 0,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  Lire <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}

        {adoptedBills.length > 0 && (
          <p style={{ textAlign: 'center', marginTop: '2rem', fontFamily: 'var(--font-corps)', fontSize: '0.8rem', color: '#9ca3af' }}>
            {adoptedBills.length} texte{adoptedBills.length > 1 ? 's' : ''} adopté{adoptedBills.length > 1 ? 's' : ''} par le Parlement des Étudiants de Lyon
          </p>
        )}
      </div>
    </div>
  )
}
