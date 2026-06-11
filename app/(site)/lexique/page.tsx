import SiteHero from '@/components/site/SiteHero'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lexique parlementaire — Parlement des Étudiants de Lyon',
  description: 'Comprendre le vocabulaire et les termes du Parlement des Étudiants de Lyon.',
}

const TERMES: { lettre: string; termes: { mot: string; definition: string }[] }[] = [
  {
    lettre: 'A',
    termes: [
      {
        mot: 'Abstention',
        definition: 'Position d\'un parlementaire qui choisit de ne voter ni pour, ni contre une proposition lors d\'un scrutin. L\'abstention n\'est comptabilisée ni dans les votes "pour" ni dans les votes "contre".',
      },
      {
        mot: 'Amendement',
        definition: 'Modification proposée à un texte en cours d\'examen (projet ou proposition de loi). Tout député étudiant peut déposer un amendement pour ajouter, supprimer ou modifier des dispositions.',
      },
    ],
  },
  {
    lettre: 'B',
    termes: [
      {
        mot: 'Bureau',
        definition: 'Organe collégial chargé de l\'organisation et du fonctionnement du Parlement des Étudiants. Il est composé du Président, des Vice-Présidents, du Secrétaire général et du Trésorier.',
      },
    ],
  },
  {
    lettre: 'C',
    termes: [
      {
        mot: 'Commission',
        definition: 'Groupe de travail thématique composé de députés étudiants, chargé d\'examiner les textes législatifs et de produire des rapports avant les séances plénières.',
      },
    ],
  },
  {
    lettre: 'D',
    termes: [
      {
        mot: 'Député étudiant',
        definition: 'Membre élu du Parlement des Étudiants de Lyon, représentant une université ou une grande école lyonnaise. Il siège en séance plénière, participe aux commissions et peut déposer des textes.',
      },
    ],
  },
  {
    lettre: 'G',
    termes: [
      {
        mot: 'Groupe politique',
        definition: 'Regroupement de députés étudiants partageant des orientations ou valeurs communes. Les groupes structurent le débat parlementaire et disposent de droits spécifiques (temps de parole, dépôt de textes, etc.).',
      },
    ],
  },
  {
    lettre: 'L',
    termes: [
      {
        mot: 'Lecture',
        definition: 'Étape d\'examen d\'un texte législatif en séance plénière. Un texte peut faire l\'objet de plusieurs lectures successives avant son adoption définitive.',
      },
    ],
  },
  {
    lettre: 'M',
    termes: [
      {
        mot: 'Majorité absolue',
        definition: 'Nombre de voix représentant plus de la moitié des suffrages exprimés (abstentions exclues). Requise pour l\'adoption de certaines résolutions importantes.',
      },
      {
        mot: 'Majorité simple',
        definition: 'Nombre de voix supérieur à celui obtenu par toute autre position (pour ou contre). Suffit pour l\'adoption de la plupart des textes ordinaires.',
      },
      {
        mot: 'Motion de censure',
        definition: 'Texte déposé par des députés pour mettre en cause la responsabilité du Bureau ou d\'un de ses membres. Son adoption entraîne la démission de la personne visée.',
      },
    ],
  },
  {
    lettre: 'O',
    termes: [
      {
        mot: 'Opposition',
        definition: 'Ensemble des groupes politiques qui ne soutiennent pas la majorité en place au Bureau du Parlement. L\'opposition joue un rôle essentiel de contre-pouvoir et de débat.',
      },
      {
        mot: 'Ordre du jour',
        definition: 'Programme officiel d\'une séance plénière, listant les textes et questions qui y seront examinés. Il est établi par le Bureau et communiqué aux députés à l\'avance.',
      },
    ],
  },
  {
    lettre: 'P',
    termes: [
      {
        mot: 'Plénière',
        definition: 'Séance réunissant l\'ensemble des députés étudiants du Parlement. C\'est en séance plénière que les textes sont débattus et votés.',
      },
      {
        mot: 'Procuration',
        definition: 'Délégation de vote accordée par un député absent à un autre député présent. La procuration permet à un parlementaire de voter au nom d\'un collègue empêché.',
      },
      {
        mot: 'Projet de loi',
        definition: 'Texte législatif soumis au Parlement par le Bureau. À distinguer de la proposition de loi, qui est d\'initiative parlementaire.',
      },
      {
        mot: 'Proposition de loi',
        definition: 'Texte législatif déposé par un ou plusieurs députés étudiants (initiative parlementaire), par opposition au projet de loi qui émane du Bureau.',
      },
    ],
  },
  {
    lettre: 'Q',
    termes: [
      {
        mot: 'Quorum',
        definition: 'Nombre minimum de députés devant être présents pour qu\'une séance soit valide et que les votes soient juridiquement opposables. Si le quorum n\'est pas atteint, la séance ne peut délibérer.',
      },
    ],
  },
  {
    lettre: 'S',
    termes: [
      {
        mot: 'Scrutin',
        definition: 'Procédure de vote lors d\'une séance. Il peut être public (à main levée ou par appel nominal) ou secret (bulletin dans l\'urne), selon les règles applicables.',
      },
      {
        mot: 'Séance',
        definition: 'Réunion officielle du Parlement. Les séances plénières sont publiques ; les séances de commission sont généralement réservées aux membres.',
      },
    ],
  },
  {
    lettre: 'V',
    termes: [
      {
        mot: 'Vote',
        definition: 'Expression formelle du suffrage d\'un député étudiant lors d\'un scrutin. Le vote peut être favorable (pour), défavorable (contre) ou traduire une abstention.',
      },
    ],
  },
]

export default function LexiquePage() {
  return (
    <div>
      <SiteHero
        badge="Vocabulaire"
        title="Lexique parlementaire"
        description="Découvrez les termes et expressions du vocabulaire parlementaire utilisés au Parlement des Étudiants de Lyon."
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {TERMES.map(({ lettre, termes }) => (
            <div key={lettre}>
              {/* Lettre */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--pel-bleu)', boxShadow: '0 4px 16px rgba(4,67,154,0.25)' }}
                >
                  <span style={{ fontFamily: 'var(--font-titre)', fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                    {lettre}
                  </span>
                </div>
                <div className="flex-1 h-px" style={{ background: 'rgba(4,67,154,0.15)' }} />
              </div>

              {/* Cartes */}
              <div className="space-y-4 pl-4">
                {termes.map(({ mot, definition }) => (
                  <div key={mot} className="glass-card rounded-2xl p-6">
                    <h2
                      className="mb-2"
                      style={{ fontFamily: 'var(--font-titre)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--pel-bleu)' }}
                    >
                      {mot}
                    </h2>
                    <p
                      className="text-gray-600 leading-relaxed"
                      style={{ fontFamily: 'var(--font-corps)', fontSize: '0.97rem' }}
                    >
                      {definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
