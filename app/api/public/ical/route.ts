export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// La table evenements a les colonnes : id, titre, date, heure, lieu, type, description
function formatIcalDate(date: string, heure?: string | null): string {
  const base = heure ? `${date}T${heure}:00` : `${date}T09:00:00`
  return new Date(base).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcal(str: string): string {
  return (str ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: evenements } = await adminClient
    .from('evenements')
    .select('id,titre,description,date,heure,lieu,type')
    .gte('date', today)
    .order('date', { ascending: true })

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PEL//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Agenda PEL',
    'X-WR-TIMEZONE:Europe/Paris',
  ]

  for (const ev of (evenements ?? [])) {
    const dtstart = formatIcalDate(ev.date, ev.heure)
    // Durée par défaut : 2h
    const endDate = new Date(ev.heure ? `${ev.date}T${ev.heure}:00` : `${ev.date}T09:00:00`)
    endDate.setHours(endDate.getHours() + 2)
    const dtend = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@assemblee-pel.fr`)
    lines.push(`DTSTART:${dtstart}`)
    lines.push(`DTEND:${dtend}`)
    lines.push(`SUMMARY:${escapeIcal(ev.titre ?? '')}`)
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcal(ev.description)}`)
    if (ev.lieu) lines.push(`LOCATION:${escapeIcal(ev.lieu)}`)
    if (ev.type) lines.push(`CATEGORIES:${escapeIcal(ev.type)}`)
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="agenda-pel.ics"',
      'Cache-Control': 'no-cache',
    },
  })
}
