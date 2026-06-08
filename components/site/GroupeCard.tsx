'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Tag } from 'lucide-react'

const POLITICAL_POSITIONS: Record<string, string> = {
  extreme_gauche: 'Extrême-gauche',
  gauche_radicale: 'Gauche radicale',
  gauche: 'Gauche',
  centre_gauche: 'Centre-gauche',
  centre: 'Centre',
  centre_droit: 'Centre-droit',
  droite: 'Droite',
  droite_radicale: 'Droite radicale',
  extreme_droite: 'Extrême-droite',
  monarchiste: 'Monarchiste',
  autre: 'Autre',
}

interface Member {
  id: string
  first_name: string
  last_name: string
}

interface GroupeCardProps {
  id: string
  name: string
  color: string
  political_position?: string | null
  ideologies?: string[] | null
  description?: string | null
  presentation?: string | null
  members: Member[]
}

export default function GroupeCard({
  name,
  color,
  political_position,
  ideologies,
  description,
  presentation,
  members,
}: GroupeCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Bandeau couleur */}
      <div style={{ height: 6, background: color }} />

      <div className="p-5">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3
              className="font-bold text-gray-900 text-lg leading-tight"
              style={{ fontFamily: 'var(--font-titre)' }}
            >
              {name}
            </h3>
            {political_position && POLITICAL_POSITIONS[political_position] && (
              <span
                className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: color + '20', color }}
              >
                {POLITICAL_POSITIONS[political_position]}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1 text-sm text-gray-500 ml-3 flex-shrink-0"
          >
            <Users size={14} />
            <span>{members.length}</span>
          </div>
        </div>

        {/* Idéologies */}
        {ideologies && ideologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ideologies.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: color + '15', color }}
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description courte */}
        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3" style={{ fontFamily: 'var(--font-corps)' }}>
            {description}
          </p>
        )}

        {/* Bouton expandable */}
        {(presentation || members.length > 0) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: color + '10',
              color,
              border: `1px solid ${color}30`,
            }}
          >
            {expanded ? (
              <>
                <ChevronUp size={16} />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                En savoir plus
              </>
            )}
          </button>
        )}

        {/* Section expandable */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {presentation && (
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(4,67,154,0.03)', border: '1px solid rgba(4,67,154,0.08)' }}
              >
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Présentation</h4>
                <p className="text-gray-700 text-sm whitespace-pre-line" style={{ fontFamily: 'var(--font-corps)' }}>
                  {presentation}
                </p>
              </div>
            )}

            {members.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Users size={14} className="text-pel-blue" />
                  Membres ({members.length})
                </h4>
                <ul className="space-y-2">
                  {members.map(m => (
                    <li key={m.id} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {m.first_name.charAt(0)}{m.last_name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700">{m.first_name} {m.last_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
