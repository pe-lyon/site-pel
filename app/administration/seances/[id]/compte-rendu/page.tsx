export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSeance(id: string) {
  const { data } = await adminClient
    .from('seances')
    .select('*, profiles(first_name, last_name)')
    .eq('id', id)
    .single()
  return data
}

async function getAgenda(seanceId: string) {
  const { data } = await adminClient
    .from('seance_agenda')
    .select('*, vote_sessions(id, title, status, opened_at, closed_at)')
    .eq('seance_id', seanceId)
    .order('ordre', { ascending: true })
  return data ?? []
}

async function getVoteResults(voteSessionId: string) {
  const { data: votes } = await adminClient
    .from('votes')
    .select('vote_value, profiles(first_name, last_name, political_groups(name, color))')
    .eq('session_id', voteSessionId)

  if (!votes) return null

  const results: {
    pour: number; contre: number; abstention: number; total: number;
    byGroup: Record<string, { name: string; color: string; pour: number; contre: number; abstention: number }>
  } = { pour: 0, contre: 0, abstention: 0, total: votes.length, byGroup: {} }

  for (const v of votes) {
    const val = v.vote_value as string
    if (val === 'pour') results.pour++
    else if (val === 'contre') results.contre++
    else if (val === 'abstention') results.abstention++

    const grp = (v.profiles as any)?.political_groups
    if (grp) {
      if (!results.byGroup[grp.name]) {
        results.byGroup[grp.name] = { name: grp.name, color: grp.color, pour: 0, contre: 0, abstention: 0 }
      }
      results.byGroup[grp.name][val as 'pour' | 'contre' | 'abstention']++
    }
  }
  return results
}

async function getParlementaires() {
  const { data } = await adminClient
    .from('profiles')
    .select('first_name, last_name, role, political_groups(name, color)')
    .order('last_name', { ascending: true })
  return data ?? []
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function CompteRenduPage({ params }: { params: { id: string } }) {
  const [seance, agenda, parlementaires] = await Promise.all([
    getSeance(params.id),
    getAgenda(params.id),
    getParlementaires(),
  ])

  if (!seance) notFound()

  const agendaWithResults = await Promise.all(
    agenda.map(async (item: any) => {
      if (item.type === 'scrutin' && item.vote_session_id) {
        const results = await getVoteResults(item.vote_session_id)
        return { ...item, results }
      }
      return { ...item, results: null }
    })
  )

  const president = seance.profiles as any
  const generatedAt = new Date().toLocaleString('fr-FR')

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Compte rendu — {seance.title}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Georgia', serif; color: #1a1a1a; background: white; font-size: 12pt; line-height: 1.6; }
          .page { max-width: 800px; margin: 0 auto; padding: 40px; }

          .header { text-align: center; border-bottom: 3px solid #1a3a6b; padding-bottom: 24px; margin-bottom: 32px; }
          .header-logo { font-size: 28pt; font-weight: bold; color: #1a3a6b; letter-spacing: 2px; margin-bottom: 4px; }
          .header-subtitle { font-size: 10pt; color: #666; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px; }
          .seance-title { font-size: 18pt; font-weight: bold; color: #1a3a6b; margin-bottom: 8px; }
          .seance-meta { font-size: 11pt; color: #444; }
          .seance-meta span { margin: 0 12px; }

          .section { margin-bottom: 32px; }
          .section-title { font-size: 13pt; font-weight: bold; color: #1a3a6b; border-bottom: 1px solid #dde; padding-bottom: 6px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }

          .agenda-item { margin-bottom: 20px; page-break-inside: avoid; }
          .agenda-item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
          .agenda-num { background: #1a3a6b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10pt; font-weight: bold; flex-shrink: 0; }
          .agenda-type-badge { background: #f0f4ff; color: #1a3a6b; border: 1px solid #c7d4f0; padding: 1px 8px; border-radius: 10px; font-size: 9pt; }
          .agenda-item-title { font-weight: bold; font-size: 12pt; }
          .agenda-content { margin-left: 34px; color: #444; font-size: 11pt; white-space: pre-wrap; }

          .vote-results { margin-left: 34px; margin-top: 10px; background: #f8f9fc; border: 1px solid #dde; border-radius: 8px; padding: 14px; }
          .vote-totals { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; }
          .vote-total { text-align: center; }
          .vote-total-num { font-size: 20pt; font-weight: bold; }
          .vote-total-num.pour { color: #16a34a; }
          .vote-total-num.contre { color: #dc2626; }
          .vote-total-num.abstention { color: #d97706; }
          .vote-total-label { font-size: 9pt; color: #666; }
          .vote-result-adopted { font-weight: bold; color: #16a34a; font-size: 11pt; margin-bottom: 8px; }
          .vote-result-rejected { font-weight: bold; color: #dc2626; font-size: 11pt; margin-bottom: 8px; }
          .bygroup-title { font-size: 10pt; font-weight: bold; color: #444; margin-bottom: 6px; }
          .bygroup-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
          .bygroup-table th { background: #e8edf7; padding: 4px 8px; text-align: left; }
          .bygroup-table td { padding: 4px 8px; border-bottom: 1px solid #eee; }

          .parlementaires-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 16px; }
          .parlementaire-item { font-size: 10pt; padding: 2px 0; }
          .parlementaire-group { color: #666; font-size: 9pt; }

          .footer { margin-top: 40px; border-top: 1px solid #dde; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; color: #888; font-size: 9pt; }
          .print-btn { position: fixed; top: 20px; right: 20px; background: #1a3a6b; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 1000; }

          @media print {
            .print-btn { display: none; }
            body { font-size: 11pt; }
            .page { padding: 20px; max-width: none; }
            .section { page-break-inside: avoid; }
          }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick={() => window?.print()}>
          Imprimer
        </button>

        <div className="page">
          {/* En-tête */}
          <div className="header">
            <div className="header-logo">P.E.L.</div>
            <div className="header-subtitle">Parlement des Étudiants de Lyon</div>
            <div className="seance-title">{seance.title}</div>
            <div className="seance-meta">
              <span>Date : {formatDate(seance.date)}</span>
              {president && <span>Président de séance : {president.first_name} {president.last_name}</span>}
              <span>Statut : {seance.status === 'terminee' ? 'Séance terminée' : seance.status === 'en_cours' ? 'En cours' : 'En préparation'}</span>
            </div>
            {seance.description && <p style={{ marginTop: 10, fontStyle: 'italic', color: '#555', fontSize: '11pt' }}>{seance.description}</p>}
          </div>

          {/* Points d'agenda */}
          <div className="section">
            <div className="section-title">Ordre du jour et compte rendu</div>
            {agendaWithResults.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>Aucun point d&apos;agenda enregistré.</p>
            ) : (
              agendaWithResults.map((item: any, idx: number) => (
                <div key={item.id} className="agenda-item">
                  <div className="agenda-item-header">
                    <div className="agenda-num">{idx + 1}</div>
                    <span className="agenda-type-badge">
                      {item.type === 'texte' ? 'Texte' : item.type === 'scrutin' ? 'Scrutin' : item.type === 'pause' ? 'Pause' : 'Information'}
                    </span>
                    <span className="agenda-item-title">{item.title}</span>
                  </div>
                  {item.content && (
                    <div className="agenda-content">{item.content}</div>
                  )}
                  {item.results && (
                    <div className="vote-results">
                      <div className="vote-totals">
                        <div className="vote-total">
                          <div className="vote-total-num pour">{item.results.pour}</div>
                          <div className="vote-total-label">Pour</div>
                        </div>
                        <div className="vote-total">
                          <div className="vote-total-num contre">{item.results.contre}</div>
                          <div className="vote-total-label">Contre</div>
                        </div>
                        <div className="vote-total">
                          <div className="vote-total-num abstention">{item.results.abstention}</div>
                          <div className="vote-total-label">Abstention</div>
                        </div>
                        <div className="vote-total">
                          <div className="vote-total-num" style={{ color: '#1a3a6b' }}>{item.results.total}</div>
                          <div className="vote-total-label">Total</div>
                        </div>
                      </div>
                      <div className={item.results.pour > item.results.contre ? 'vote-result-adopted' : 'vote-result-rejected'}>
                        {item.results.pour > item.results.contre ? 'ADOPTÉ' : 'REJETÉ'}
                      </div>
                      {Object.keys(item.results.byGroup).length > 0 && (
                        <>
                          <div className="bygroup-title">Résultats par groupe</div>
                          <table className="bygroup-table">
                            <thead>
                              <tr>
                                <th>Groupe</th>
                                <th>Pour</th>
                                <th>Contre</th>
                                <th>Abstention</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.values(item.results.byGroup).map((g: any) => (
                                <tr key={g.name}>
                                  <td style={{ color: g.color, fontWeight: 500 }}>{g.name}</td>
                                  <td style={{ color: '#16a34a' }}>{g.pour}</td>
                                  <td style={{ color: '#dc2626' }}>{g.contre}</td>
                                  <td style={{ color: '#d97706' }}>{g.abstention}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Parlementaires */}
          <div className="section">
            <div className="section-title">Parlementaires ({parlementaires.length})</div>
            <div className="parlementaires-grid">
              {parlementaires.map((p: any) => (
                <div key={p.first_name + p.last_name} className="parlementaire-item">
                  <div>{p.first_name} {p.last_name}</div>
                  {p.political_groups && (
                    <div className="parlementaire-group" style={{ color: p.political_groups.color }}>
                      {p.political_groups.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pied de page */}
          <div className="footer">
            <span>Parlement des Étudiants de Lyon — assemblee-pel.vercel.app</span>
            <span>Généré le {generatedAt}</span>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn').addEventListener('click', function() { window.print(); });
        ` }} />
      </body>
    </html>
  )
}
