import { NextRequest, NextResponse } from 'next/server'

// In-memory store — keyed by seance (or 'default')
interface DemandeParole {
  id: string
  nom: string
  userId: string
  createdAt: number
}

const demandesStore = new Map<string, DemandeParole[]>()

function getSeanceKey(req: NextRequest) {
  const url = new URL(req.url)
  return url.searchParams.get('seance') ?? 'default'
}

export async function GET(req: NextRequest) {
  const key = getSeanceKey(req)
  const demandes = demandesStore.get(key) ?? []
  return NextResponse.json({ demandes })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, seance = 'default' } = body

  if (action === 'demander') {
    const { nom, userId } = body
    if (!nom) return NextResponse.json({ error: 'nom requis' }, { status: 400 })

    const demandes = demandesStore.get(seance) ?? []
    // Éviter les doublons par userId
    if (userId && demandes.some(d => d.userId === userId)) {
      return NextResponse.json({ error: 'Vous avez déjà demandé la parole' }, { status: 409 })
    }
    const newDemande: DemandeParole = {
      id: crypto.randomUUID(),
      nom,
      userId: userId ?? '',
      createdAt: Date.now(),
    }
    demandes.push(newDemande)
    demandesStore.set(seance, demandes)
    return NextResponse.json({ success: true, demande: newDemande })
  }

  if (action === 'retirer') {
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
    const demandes = demandesStore.get(seance) ?? []
    demandesStore.set(seance, demandes.filter(d => d.id !== id))
    return NextResponse.json({ success: true })
  }

  if (action === 'vider') {
    demandesStore.delete(seance)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
