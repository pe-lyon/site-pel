import { createClient } from '@supabase/supabase-js'
import SiteHero from '@/components/site/SiteHero'
import { FileText, Download, Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Espace presse — Parlement des Étudiants de Lyon',
  description: 'Communiqués de presse et contact presse du Parlement des Étudiants de Lyon.',
}

export default async function PressePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: ressources }, { data: setting }] = await Promise.all([
    supabase
      .from('ressources')
      .select('id, titre, description, url, publie_le, version')
      .eq('categorie', 'presse')
      .order('publie_le', { ascending: false }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'presse_contact')
      .single(),
  ])

  const contactEmail: string | null = setting?.value
    ? (typeof setting.value === 'string' ? setting.value : setting.value?.email ?? null)
    : null

  const docs = ressources ?? []

  return (
    <div>
      <SiteHero
        badge="Espace presse"
        title="Presse"
        description="Retrouvez ici les communiqués de presse du Parlement des Étudiants de Lyon et les informations pour contacter notre équipe de communication."
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Contact presse */}
          <div>
            <h2
              className="mb-6 text-center"
              style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Contact presse
            </h2>
            <div className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(4,67,154,0.08)' }}
              >
                <Mail size={28} style={{ color: 'var(--pel-bleu)' }} />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e' }}>
                  Service communication du PEL
                </p>
                <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'var(--font-corps)' }}>
                  Pour toute demande d'interview, accréditation ou information presse
                </p>
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-block mt-3 font-semibold"
                    style={{ fontFamily: 'var(--font-corps)', color: 'var(--pel-bleu)', wordBreak: 'break-all' }}
                  >
                    {contactEmail}
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-gray-400 italic" style={{ fontFamily: 'var(--font-corps)' }}>
                    Adresse email à venir — contactez-nous via le formulaire de contact.
                  </p>
                )}
              </div>
              {!contactEmail && (
                <a
                  href="/contact"
                  className="btn-outline flex-shrink-0 text-sm py-2 px-5"
                  style={{ fontFamily: 'var(--font-corps)' }}
                >
                  Formulaire de contact →
                </a>
              )}
            </div>
          </div>

          {/* Communiqués */}
          <div>
            <h2
              className="mb-6 text-center"
              style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--pel-bleu)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Communiqués de presse
            </h2>

            {docs.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(4,67,154,0.06)' }}
                >
                  <FileText size={28} style={{ color: 'var(--pel-bleu)', opacity: 0.5 }} />
                </div>
                <p
                  className="font-semibold text-gray-700"
                  style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem' }}
                >
                  Aucun communiqué disponible
                </p>
                <p className="mt-2 text-sm text-gray-400" style={{ fontFamily: 'var(--font-corps)' }}>
                  Les communiqués de presse du Parlement des Étudiants seront publiés ici.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="glass-card rounded-2xl p-6 flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(4,67,154,0.08)' }}
                    >
                      <FileText size={20} style={{ color: 'var(--pel-bleu)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>
                        {doc.titre}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>
                          {doc.description}
                        </p>
                      )}
                      {doc.publie_le && (
                        <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>
                          Publié le {new Date(doc.publie_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary flex-shrink-0 text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <Download size={14} />
                        Télécharger
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
