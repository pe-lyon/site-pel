'use client'

import { useEffect, useState, useCallback } from 'react'
import { Profile, PoliticalGroup } from '@/types'
import { getInitials } from '@/lib/utils'
import ParliamentChart from './ParliamentChart'

interface Seat {
  profile: Profile
  x: number
  y: number
  angle: number
}

interface GroupInfo {
  group: PoliticalGroup
  count: number
}

const POSITION_ORDER: Record<string, number> = {
  extreme_gauche: 0,
  gauche_radicale: 1,
  gauche: 2,
  centre_gauche: 3,
  centre: 4,
  centre_droit: 5,
  droite: 6,
  droite_radicale: 7,
  extreme_droite: 8,
  monarchiste: 9,
  autre: 10,
}

const POSITION_LABELS: Record<string, string> = {
  extreme_gauche: 'Extrême gauche',
  gauche_radicale: 'Gauche radicale',
  gauche: 'Gauche',
  centre_gauche: 'Centre gauche',
  centre: 'Centre',
  centre_droit: 'Centre droit',
  droite: 'Droite',
  droite_radicale: 'Droite radicale',
  extreme_droite: 'Extrême droite',
  monarchiste: 'Monarchiste',
  autre: 'Autre',
}

function getPositionOrder(group: PoliticalGroup | undefined): number {
  if (!group) return 5
  const pos = (group as any).political_position
  if (!pos) return 5
  return POSITION_ORDER[pos] ?? 10
}

function computeSeats(profiles: Profile[]): Seat[] {
  if (profiles.length === 0) return []

  const cx = 500
  const cy = 420
  const rows = 4
  const baseRadius = 200
  const radiusStep = 60
  const startAngle = Math.PI
  const endAngle = 2 * Math.PI

  // Trier par position politique gauche → droite
  const sorted = [...profiles].sort((a, b) => {
    const pa = getPositionOrder(a.political_groups)
    const pb = getPositionOrder(b.political_groups)
    if (pa !== pb) return pa - pb
    // Même groupe → ordre alphabétique
    return (a.last_name ?? '').localeCompare(b.last_name ?? '')
  })

  const seats: Seat[] = []
  const total = sorted.length

  const seatsPerRow: number[] = []
  let remaining = total
  for (let r = 0; r < rows; r++) {
    const share = Math.ceil(remaining / (rows - r))
    seatsPerRow.push(share)
    remaining -= share
  }

  let profileIdx = 0
  for (let r = 0; r < rows; r++) {
    const count = seatsPerRow[r]
    const radius = baseRadius + r * radiusStep
    for (let i = 0; i < count; i++) {
      if (profileIdx >= sorted.length) break
      const angle = startAngle + (i / Math.max(count - 1, 1)) * (endAngle - startAngle)
      const x = cx + radius * Math.cos(angle)
      const y = cy + radius * Math.sin(angle)
      seats.push({ profile: sorted[profileIdx], x, y, angle })
      profileIdx++
    }
  }

  return seats
}

async function adminRead(table: string, select = '*', order?: { col: string }, filters?: Record<string, string>) {
  const res = await fetch('/api/admin/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, select, order, filters }),
  })
  const result = await res.json()
  return result.data ?? []
}

export default function HemicycleView() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [groups, setGroups] = useState<PoliticalGroup[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [presidentName, setPresidentName] = useState<string>('PRÉSIDENCE')

  const fetchData = useCallback(async () => {
    const [profilesData, groupsData] = await Promise.all([
      adminRead('profiles', '*, political_groups!profiles_group_id_fkey(*)', { col: 'last_name' }),
      adminRead('political_groups', '*', { col: 'name' }),
    ])

    // Seuls les parlementaires, présidents de groupe et ministres apparaissent dans les sièges
    const SIEGE_ROLES = ['parlementaire', 'president_groupe', 'ministre']
    setProfiles((profilesData as Profile[]).filter(p => SIEGE_ROLES.includes(p.role)))
    setGroups(groupsData)

    // Président(s) de séance → affichés à la présidence
    const presSeance = (profilesData as Profile[]).filter(p => p.role === 'president_seance')
    if (presSeance.length > 0) {
      setPresidentName(presSeance.map(p => `${p.first_name} ${p.last_name}`).join(' · '))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Groupes triés par position politique
  const groupInfos: GroupInfo[] = groups.map(group => ({
    group,
    count: profiles.filter(p => p.group_id === group.id).length,
  }))
    .filter(g => g.count > 0)
    .sort((a, b) => getPositionOrder(a.group) - getPositionOrder(b.group))

  // Sièges triés gauche → droite pour ParliamentChart
  const sortedProfiles = [...profiles].sort((a, b) => {
    const pa = getPositionOrder(a.political_groups)
    const pb = getPositionOrder(b.political_groups)
    if (pa !== pb) return pa - pb
    return (a.last_name ?? '').localeCompare(b.last_name ?? '')
  })
  const parliamentSeats = sortedProfiles.map(p => ({
    id: p.id,
    color: p.political_groups?.color ?? '#94a3b8',
    label: `${p.first_name} ${p.last_name}`,
    sublabel: p.political_groups?.name,
    meta: p.role?.replace(/_/g, ' '),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Hémicycle */}
      <div className="flex-1">
        <div className="card overflow-visible">
          <ParliamentChart
            seats={parliamentSeats}
            selectedId={selected?.id ?? null}
            onSelect={(id) => {
              if (!id) { setSelected(null); return }
              const p = profiles.find(x => x.id === id) ?? null
              setSelected(p)
            }}
            presidentLabel={presidentName}
          />

          {/* Fiche parlementaire sélectionné */}
          {selected && (
            <div
              className="mt-4 p-4 rounded-lg border-2 flex items-start gap-4"
              style={{ borderColor: selected.political_groups?.color ?? '#e5e7eb' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                style={{ backgroundColor: selected.political_groups?.color ?? '#94a3b8' }}
              >
                {getInitials(selected.first_name, selected.last_name)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{selected.first_name} {selected.last_name}</p>
                <p className="text-sm text-gray-500 capitalize">{selected.role?.replace(/_/g, ' ')}</p>
                {selected.political_groups && (
                  <>
                    <p className="text-sm font-medium mt-1" style={{ color: selected.political_groups.color }}>
                      {selected.political_groups.name}
                    </p>
                    {(selected.political_groups as any).political_position && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {POSITION_LABELS[(selected.political_groups as any).political_position] ?? (selected.political_groups as any).political_position}
                      </p>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Légende groupes */}
      <div className="lg:w-64 space-y-4">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Groupes politiques
          </h3>
          <div className="space-y-2">
            {groupInfos.map(({ group, count }) => (
              <div key={group.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-sm text-gray-700 block truncate">{group.name}</span>
                    {(group as any).political_position && (
                      <span className="text-xs text-gray-400 block truncate">
                        {POSITION_LABELS[(group as any).political_position] ?? (group as any).political_position}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-500 flex-shrink-0 ml-2">{count}</span>
              </div>
            ))}
            {groupInfos.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-2">Aucun groupe</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Députés</span>
            <span className="font-bold text-pel-blue">{profiles.length}</span>
          </div>
        </div>

        <div className="card bg-pel-blue/5">
          <p className="text-xs text-gray-500">
            Cliquez sur un siège pour afficher le parlementaire. Les sièges vont de gauche à droite selon la position politique. L&apos;hémicycle se met à jour en temps réel.
          </p>
        </div>
      </div>
    </div>
  )
}
