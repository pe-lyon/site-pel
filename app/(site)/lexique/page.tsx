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
        definition: 'Position d\'un parlementaire qui choisit de ne voter ni pour, ni contre une proposition lors d\'un scrutin. Les abstentions ne sont pas comptabilisées dans les suffrages exprimés.',
      },
      {
        mot: 'Adoption',
        definition: 'Décision par laquelle le Parlement approuve définitivement un texte à l\'issue du scrutin. Un texte est adopté lorsqu\'il recueille la majorité requise des suffrages exprimés.',
      },
      {
        mot: 'Amendement',
        definition: 'Modification proposée à un texte en cours d\'examen en séance. Tout parlementaire peut déposer un amendement pour ajouter, supprimer ou reformuler des dispositions avant le vote.',
      },
      {
        mot: 'Appel nominal',
        definition: 'Mode de scrutin dans lequel le Président appelle chaque parlementaire nominativement pour recueillir son vote à voix haute. Il permet de connaître publiquement la position de chacun.',
      },
      {
        mot: 'Aparté',
        definition: 'Conversation tenue à voix basse entre parlementaires pendant la séance, sans interrompre les débats officiels. Les apartés prolongés sont découragés car ils perturbent l\'attention de l\'assemblée.',
      },
    ],
  },
  {
    lettre: 'B',
    termes: [
      {
        mot: 'Bureau',
        definition: 'Organe exécutif et collégial du Parlement des Étudiants. Il est composé du Président de séance, des Vice-Présidents et du Secrétaire général. Il fixe l\'ordre du jour, organise les séances et veille au bon fonctionnement de l\'institution.',
      },
    ],
  },
  {
    lettre: 'C',
    termes: [
      {
        mot: 'Clôture des débats',
        definition: 'Décision du Président de séance mettant fin aux discussions sur un point de l\'ordre du jour pour passer au vote. Elle peut être demandée par un groupe politique ou décidée d\'office par le Président.',
      },
      {
        mot: 'Compte-rendu',
        definition: 'Document officiel récapitulant le déroulé d\'une séance : textes examinés, résultats des votes, interventions notables. Il est publié sur le site du PEL après chaque séance.',
      },
    ],
  },
  {
    lettre: 'D',
    termes: [
      {
        mot: 'Débat',
        definition: 'Phase de discussion orale en séance, au cours de laquelle les parlementaires prennent la parole pour soutenir ou critiquer un texte. Le Président de séance gère la liste des orateurs et distribue le temps de parole.',
      },
      {
        mot: 'Dépôt de texte',
        definition: 'Acte par lequel un groupe politique ou un parlementaire soumet formellement une proposition de résolution ou de loi au Bureau pour inscription à l\'ordre du jour d\'une séance.',
      },
      {
        mot: 'Discussion générale',
        definition: 'Premier temps du débat sur un texte, dans lequel les groupes expriment leur position d\'ensemble avant l\'examen article par article. Elle permet de cadrer les enjeux politiques du texte.',
      },
      {
        mot: 'Droit de réponse',
        definition: 'Faculté accordée à un parlementaire mis en cause personnellement dans un discours de prendre la parole brièvement pour répondre, sous réserve de l\'autorisation du Président de séance.',
      },
    ],
  },
  {
    lettre: 'E',
    termes: [
      {
        mot: 'Explication de vote',
        definition: 'Prise de parole brève d\'un parlementaire ou d\'un groupe politique juste avant ou après le scrutin pour exposer publiquement les raisons de son vote. Elle n\'a pas vocation à rouvrir le débat.',
      },
    ],
  },
  {
    lettre: 'G',
    termes: [
      {
        mot: 'Groupe politique',
        definition: 'Regroupement de parlementaires partageant des orientations idéologiques communes. Les groupes structurent le débat, disposent d\'un temps de parole attribué et peuvent déposer des textes collectivement.',
      },
    ],
  },
  {
    lettre: 'H',
    termes: [
      {
        mot: 'Hémicycle',
        definition: 'Salle semi-circulaire dans laquelle siègent les parlementaires pour les séances. Par convention, les groupes de gauche siègent à gauche du Président et les groupes de droite à sa droite.',
      },
    ],
  },
  {
    lettre: 'I',
    termes: [
      {
        mot: 'Incident de séance',
        definition: 'Perturbation survenant en cours de séance (interpellation, agitation, non-respect du temps de parole). Le Président de séance dispose de plusieurs moyens pour y mettre fin, allant du rappel à l\'ordre à la suspension de séance.',
      },
      {
        mot: 'Initiative parlementaire',
        definition: 'Droit de tout parlementaire ou groupe politique de déposer une proposition de texte. À distinguer de l\'initiative du Bureau, qui dépose des projets.',
      },
    ],
  },
  {
    lettre: 'L',
    termes: [
      {
        mot: 'Levée de séance',
        definition: 'Décision du Président de séance mettant officiellement fin à la réunion. Elle intervient une fois l\'ordre du jour épuisé ou en cas de force majeure.',
      },
      {
        mot: 'Liste des orateurs',
        definition: 'Registre tenu par le Président de séance ou la Présidence recensant les parlementaires souhaitant prendre la parole. La parole est accordée dans l\'ordre d\'inscription.',
      },
    ],
  },
  {
    lettre: 'M',
    termes: [
      {
        mot: 'Majorité absolue',
        definition: 'Plus de la moitié des suffrages exprimés (abstentions exclues). Elle est requise pour l\'adoption des textes les plus importants.',
      },
      {
        mot: 'Majorité qualifiée',
        definition: 'Seuil de vote supérieur à la majorité absolue (par exemple, les deux tiers des suffrages exprimés). Exigée pour certaines décisions exceptionnelles comme la motion de censure.',
      },
      {
        mot: 'Majorité simple',
        definition: 'Plus de voix "pour" que de voix "contre", sans condition sur le total des suffrages. Suffit pour l\'adoption de la plupart des textes ordinaires.',
      },
      {
        mot: 'Motion de censure',
        definition: 'Texte déposé par des parlementaires pour mettre en cause la responsabilité du Bureau. Elle est soumise à des conditions de recevabilité strictes et, si adoptée, oblige le Bureau ou son membre visé à démissionner.',
      },
      {
        mot: 'Motion d\'ordre',
        definition: 'Intervention d\'un parlementaire pour signaler un problème de procédure ou demander l\'application du règlement. Elle est prioritaire sur tout autre point de l\'ordre du jour.',
      },
      {
        mot: 'Motion de renvoi',
        definition: 'Motion par laquelle un groupe demande que le texte en débat soit réexaminé ou renvoyé, sans être soumis au vote immédiat. Elle suspend momentanément la procédure.',
      },
    ],
  },
  {
    lettre: 'O',
    termes: [
      {
        mot: 'Opposition',
        definition: 'Ensemble des groupes politiques qui ne soutiennent pas la majorité présente au Bureau. L\'opposition joue un rôle essentiel de contrôle et de contre-pouvoir en hémicycle.',
      },
      {
        mot: 'Ordre du jour',
        definition: 'Programme officiel d\'une séance, listant les textes et points qui y seront examinés, dans leur ordre de passage. Il est établi par le Bureau et communiqué aux parlementaires avant la séance.',
      },
      {
        mot: 'Orateur',
        definition: 'Parlementaire inscrit sur la liste des prises de parole et autorisé par le Président à s\'exprimer à la tribune ou depuis son siège.',
      },
    ],
  },
  {
    lettre: 'P',
    termes: [
      {
        mot: 'Parlementaire',
        definition: 'Membre du Parlement des Étudiants de Lyon, siégeant en hémicycle lors des séances. Il peut prendre la parole, déposer des textes, voter et représenter son groupe politique.',
      },
      {
        mot: 'Point d\'ordre',
        definition: 'Intervention urgente d\'un parlementaire pour signaler une irrégularité de procédure ou une violation du règlement, indépendamment du sujet débattu au moment de l\'intervention.',
      },
      {
        mot: 'Prise de parole',
        definition: 'Moment où un parlementaire s\'exprime à la tribune ou depuis son siège, après avoir été reconnu par le Président. Le temps de parole est strictement encadré.',
      },
      {
        mot: 'Procuration',
        definition: 'Délégation de vote accordée par un parlementaire absent à un collègue présent. La procuration permet à ce dernier de voter deux fois : une fois en son nom, une fois au nom du délégant.',
      },
      {
        mot: 'Projet de texte',
        definition: 'Texte soumis au Parlement à l\'initiative du Bureau. À distinguer de la proposition, d\'initiative parlementaire.',
      },
      {
        mot: 'Proposition',
        definition: 'Texte déposé à l\'initiative d\'un ou plusieurs parlementaires (résolution, motion, loi fictive). Elle doit être inscrite à l\'ordre du jour par le Bureau pour être débattue.',
      },
      {
        mot: 'Président de séance',
        definition: 'Parlementaire qui dirige les débats en hémicycle. Il donne et retire la parole, veille au respect du règlement, proclame les résultats des votes et ouvre et lève la séance.',
      },
    ],
  },
  {
    lettre: 'Q',
    termes: [
      {
        mot: 'Question au Bureau',
        definition: 'Interrogation posée oralement ou par écrit par un parlementaire à destination du Bureau sur un sujet relevant de sa compétence. Elle peut donner lieu à un débat bref.',
      },
      {
        mot: 'Quorum',
        definition: 'Nombre minimum de parlementaires devant être présents ou représentés pour que la séance puisse délibérer et que les votes soient valides. En l\'absence de quorum, la séance ne peut pas voter.',
      },
    ],
  },
  {
    lettre: 'R',
    termes: [
      {
        mot: 'Rappel au règlement',
        definition: 'Intervention prioritaire d\'un parlementaire invoquant une disposition précise du règlement intérieur. Le Président doit y répondre avant de reprendre le cours normal des débats.',
      },
      {
        mot: 'Rappel à l\'ordre',
        definition: 'Sanction prononcée par le Président de séance à l\'encontre d\'un parlementaire dont le comportement perturbe les débats. Un second rappel à l\'ordre peut entraîner une sanction plus grave.',
      },
      {
        mot: 'Résolution',
        definition: 'Texte par lequel le Parlement exprime une position, un vœu ou une recommandation sur un sujet donné. La résolution n\'a pas de valeur contraignante mais traduit la volonté politique de l\'assemblée.',
      },
    ],
  },
  {
    lettre: 'S',
    termes: [
      {
        mot: 'Scrutin',
        definition: 'Procédure de vote en séance. Il peut être public (à main levée ou par appel nominal) ou électronique, selon les modalités prévues par le règlement.',
      },
      {
        mot: 'Séance',
        definition: 'Réunion officielle du Parlement réunissant l\'ensemble des parlementaires en hémicycle pour délibérer et voter sur les textes inscrits à l\'ordre du jour.',
      },
      {
        mot: 'Suffrage exprimé',
        definition: 'Voix comptabilisée dans les résultats d\'un scrutin, correspondant aux votes "pour" et "contre". Les abstentions et les bulletins blancs ou nuls ne sont pas des suffrages exprimés.',
      },
      {
        mot: 'Suspension de séance',
        definition: 'Interruption temporaire des débats décidée par le Président de séance, à sa propre initiative ou à la demande d\'un groupe politique. Elle permet aux groupes de se concerter avant un vote.',
      },
    ],
  },
  {
    lettre: 'T',
    termes: [
      {
        mot: 'Temps de parole',
        definition: 'Durée accordée à chaque orateur ou groupe politique pour s\'exprimer lors d\'un débat. Il est fixé par le Bureau en amont de la séance et contrôlé par le Président.',
      },
      {
        mot: 'Tour de table',
        definition: 'Phase d\'expression succincte où chaque groupe politique prend la parole à la suite, généralement en ouverture ou clôture d\'un débat, pour présenter brièvement sa position.',
      },
      {
        mot: 'Tribune',
        definition: 'Pupitre situé face à l\'hémicycle depuis lequel les parlementaires peuvent s\'exprimer lors des débats. Prendre la parole à la tribune signifie s\'exprimer de manière formelle devant l\'assemblée.',
      },
    ],
  },
  {
    lettre: 'U',
    termes: [
      {
        mot: 'Unanimité',
        definition: 'Résultat d\'un vote dans lequel l\'ensemble des suffrages exprimés sont favorables. Un texte adopté à l\'unanimité ne recueille aucun vote contre ni aucune abstention.',
      },
    ],
  },
  {
    lettre: 'V',
    termes: [
      {
        mot: 'Vote',
        definition: 'Expression formelle du suffrage d\'un parlementaire lors d\'un scrutin. Le vote peut être favorable (pour), défavorable (contre) ou se traduire par une abstention.',
      },
      {
        mot: 'Vote à main levée',
        definition: 'Mode de scrutin dans lequel les parlementaires expriment leur vote en levant la main. Rapide et visible, il est utilisé pour les votes courants lorsqu\'il n\'y a pas de demande de vote électronique.',
      },
      {
        mot: 'Vote bloqué',
        definition: 'Procédure permettant au Bureau de demander que le Parlement se prononce par un vote unique sur tout ou partie d\'un texte, en ne retenant que les amendements acceptés.',
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
        description="Découvrez les termes et expressions du vocabulaire parlementaire utilisés lors des séances du Parlement des Étudiants de Lyon."
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro */}
          <div style={{
            background: 'rgba(4,67,154,0.05)',
            border: '1px solid rgba(4,67,154,0.12)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '3rem',
            display: 'flex',
            gap: '0.875rem',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>ℹ️</span>
            <p style={{ fontFamily: 'var(--font-corps)', color: '#374151', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
              Le PEL fonctionne en simulation parlementaire — nos séances se déroulent exclusivement
              en hémicycle, sans commission. Les termes ci-dessous reflètent le vocabulaire
              officiel de nos séances, inspiré du règlement de l'Assemblée nationale et
              adapté à notre fonctionnement.
            </p>
          </div>

          <div className="space-y-12">
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
                <div className="space-y-3 pl-4">
                  {termes.map(({ mot, definition }) => (
                    <div key={mot} className="glass-card rounded-2xl p-6">
                      <h2
                        className="mb-2"
                        style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--pel-bleu)' }}
                      >
                        {mot}
                      </h2>
                      <p
                        className="text-gray-600 leading-relaxed"
                        style={{ fontFamily: 'var(--font-corps)', fontSize: '0.93rem' }}
                      >
                        {definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
