'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, PoliticalGroup } from '@/types'
import { getInitials } from '@/lib/utils'

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

function computeSeats(profiles: Profile[]): Seat[] {
  if (profiles.length === 0) return []

  const cx = 500
  const cy = 420
  const rows = 4
  const baseRadius = 200
  const radiusStep = 60
  const startAngle = Math.PI
  const endAngle = 2 * Math.PI

  const seats: Seat[] = []
  const total = profiles.length

  // Distribuer les sièges en rangées concentriques
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
      if (profileIdx >= profiles.length) break
      const angle = startAngle + (i / Math.max(count - 1, 1)) * (endAngle - startAngle)
      const x = cx + radius * Math.cos(angle)
      const y = cy + radius * Math.sin(angle)
      seats.push({ profile: profiles[profileIdx], x, y, angle })
      profileIdx++
    }
  }

  return seats
}

export default function HemicycleView() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [groups, setGroups] = useState<PoliticalGroup[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [{ data: profilesData }, { data: groupsData }] = await Promise.all([
      supabase.from('profiles').select('*, political_groups(*)').order('last_name'),
      supabase.from('political_groups').select('*').order('name'),
    ])
    setProfiles(profilesData ?? [])
    setGroups(groupsData ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()

    // Temps réel
    const channel = supabase
      .channel('hemicycle-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'political_groups' }, fetchData)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchData, supabase])

  const seats = computeSeats(profiles)

  const groupInfos: GroupInfo[] = groups.map(group => ({
    group,
    count: profiles.filter(p => p.group_id === group.id).length,
  })).filter(g => g.count > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-pel-blue/30 border-t-pel-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* SVG Hémicycle */}
      <div className="flex-1">
        <div className="card overflow-hidden">
          <div className="relative">
            <svg
              viewBox="0 0 1000 500"
              className="w-full"
              style={{ maxHeight: '500px' }}
            >
              {/* Arc de l'hémicycle */}
              <path
                d="M 80 420 A 420 420 0 0 1 920 420"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M 140 420 A 360 360 0 0 1 860 420"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1.5"
              />
              <path
                d="M 200 420 A 300 300 0 0 1 800 420"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1.5"
              />
              <path
                d="M 260 420 A 240 240 0 0 1 740 420"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1.5"
              />

              {/* Podium présidence */}
              <ellipse cx="500" cy="430" rx="55" ry="22" fill="#1a3a6b" />
              <text x="500" y="434" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                PRÉSIDENCE
              </text>

              {/* Sièges */}
              {seats.map((seat, idx) => {
                const group = seat.profile.political_groups
                const color = group?.color ?? '#94a3b8'
                const isSelected = selected?.id === seat.profile.id
                return (
                  <g
                    key={seat.profile.id}
                    onClick={() => setSelected(isSelected ? null : seat.profile)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r={isSelected ? 16 : 13}
                      fill={color}
                      stroke={isSelected ? '#1a3a6b' : 'white'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all duration-150"
                    />
                    <text
                      x={seat.x}
                      y={seat.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="7"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {getInitials(seat.profile.first_name, seat.profile.last_name)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

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
                  <p className="text-sm font-medium mt-1" style={{ color: selected.political_groups.color }}>
                    {selected.political_groups.name}
                  </p>
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
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="text-sm text-gray-700 truncate">{group.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-500 flex-shrink-0">{count}</span>
              </div>
            ))}
            {groupInfos.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-2">Aucun groupe</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-pel-blue">{profiles.length}</span>
          </div>
        </div>

        <div className="card bg-pel-blue/5">
          <p className="text-xs text-gray-500">
            Cliquez sur un siège pour afficher le parlementaire. L&apos;hémicycle se met à jour en temps réel.
          </p>
        </div>
      </div>
    </div>
  )
}
