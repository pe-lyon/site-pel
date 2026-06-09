import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatIcalDate(dt: string | null | undefined, fallback?: string): string {
  const date = new Date(dt ?? fallback ?? new Date().toISOString())
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcal(str: string): string {
  return (str ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET() {
  const { data: evenements } = await adminClient
    .from('evenements')
    .select('id,title,description,date_debut,date_fin,lieu')
    .gte('date_debut', new Date().toISOString())
    .order('date_debut', { ascending: true })

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
    const dtstart = formatIcalDate(ev.date_debut)
    const dtend = formatIcalDate(ev.date_fin, ev.date_debut)
    const uid = `${ev.id}@pel-lyon.fr`
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTART:${dtstart}`)
    lines.push(`DTEND:${dtend}`)
    lines.push(`SUMMARY:${escapeIcal(ev.title ?? '')}`)
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcal(ev.description)}`)
    if (ev.lieu) lines.push(`LOCATION:${escapeIcal(ev.lieu)}`)
    lines.push(`DTSTAMP:${formatIcalDate(new Date().toISOString())}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const icsContent = lines.join('\r\n')

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="agenda-pel.ics"',
      'Cache-Control': 'no-cache',
    },
  })
}
