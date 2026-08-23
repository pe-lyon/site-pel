import { getSettings, getEvenements, getActualites } from '@/lib/cms'
import HomeContent from '@/components/site/HomeContent'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [settings, evenements, actualites] = await Promise.all([
    getSettings(['hero_titre', 'hero_sous_titre', 'cta_texte']),
    getEvenements(3),
    getActualites(3),
  ])

  return (
    <HomeContent
      settings={settings}
      evenements={evenements ?? []}
      actualites={actualites ?? []}
    />
  )
}
