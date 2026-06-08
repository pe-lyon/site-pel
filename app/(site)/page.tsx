import { getSettings, getEvenements, getActualites, getChiffresCles } from '@/lib/cms'
import HomeContent from '@/components/site/HomeContent'

export const revalidate = 60

export default async function HomePage() {
  const [settings, evenements, actualites, chiffres] = await Promise.all([
    getSettings(['hero_titre', 'hero_sous_titre', 'pel_bref_texte', 'cta_texte']),
    getEvenements(3),
    getActualites(3),
    getChiffresCles(),
  ])

  return (
    <HomeContent
      settings={settings}
      evenements={evenements ?? []}
      actualites={actualites ?? []}
      chiffres={chiffres ?? []}
    />
  )
}
