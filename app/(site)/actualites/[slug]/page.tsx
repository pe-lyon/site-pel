import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import ShareButtons from '@/components/site/ShareButtons'

export const dynamic = 'force-dynamic'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await adminClient.from('actualites').select('titre, extrait').eq('slug', slug).eq('statut', 'publie').single()
  if (!data) return { title: 'Article introuvable' }
  return {
    title: `${data.titre} — PEL`,
    description: data.extrait ?? undefined,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: article } = await adminClient
    .from('actualites')
    .select('*')
    .eq('slug', slug)
    .eq('statut', 'publie')
    .single()

  if (!article) notFound()

  const contenuTexte: string = typeof article.contenu === 'string'
    ? article.contenu
    : (article.contenu?.texte ?? '')

  const dateStr = article.publie_le
    ? new Date(article.publie_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://assemblee-pel.fr'}/actualites/${slug}`

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8effc 100%)' }}>

      {/* Retour */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}
        >
          <ArrowLeft size={16} /> Toutes les actualités
        </Link>
      </div>

      {/* Article */}
      <div style={{ maxWidth: '800px', margin: '1.5rem auto', padding: '0 1.5rem 4rem' }}>
        <div style={{
          background: 'white', borderRadius: '1.5rem', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(4,67,154,0.10)',
        }}>
          {/* En-tête */}
          <div style={{ padding: 'clamp(1.25rem, 5vw, 2.5rem) clamp(1.25rem, 5vw, 2.5rem) 2rem' }}>
            {article.categorie && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25rem 0.75rem', borderRadius: '999px',
                background: 'rgba(4,67,154,0.08)', color: 'var(--pel-bleu)',
                fontFamily: 'var(--font-corps)', fontSize: '0.75rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}>
                <Tag size={11} /> {article.categorie}
              </span>
            )}

            <h1 style={{
              fontFamily: 'var(--font-titre)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 800, color: 'var(--pel-bleu)', lineHeight: 1.2, margin: '0 0 1rem',
            }}>
              {article.titre}
            </h1>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {dateStr && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: '#6b7280' }}>
                  <Calendar size={14} /> {dateStr}
                </span>
              )}
              {article.auteur && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: '#6b7280' }}>
                  <User size={14} /> {article.auteur}
                </span>
              )}
            </div>

            {article.extrait && (
              <p style={{
                fontFamily: 'var(--font-corps)', fontSize: '1.05rem', color: '#374151',
                lineHeight: 1.7, marginTop: '1.5rem', fontStyle: 'italic',
                borderLeft: '3px solid var(--pel-bleu)', paddingLeft: '1rem',
              }}>
                {article.extrait}
              </p>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ height: '1px', background: 'rgba(4,67,154,0.08)', margin: '0 2.5rem' }} />

          {/* Contenu */}
          {contenuTexte && (
            <div style={{ padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1.25rem, 5vw, 2.5rem)' }}>
              <div style={{ fontFamily: 'var(--font-corps)', fontSize: '1rem', color: '#374151', lineHeight: 1.8 }}>
                {contenuTexte.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} style={{ marginBottom: '1.25rem' }}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Partage */}
          <div style={{ padding: '0 clamp(1.25rem, 5vw, 2.5rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
            <div style={{ height: '1px', background: 'rgba(4,67,154,0.08)', marginBottom: '1.5rem' }} />
            <ShareButtons url={articleUrl} titre={article.titre} />
          </div>
        </div>
      </div>
    </div>
  )
}
