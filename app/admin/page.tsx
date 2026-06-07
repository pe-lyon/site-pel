import Link from 'next/link'
import { Calendar, Newspaper, Info, Users, Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const cards = [
    { href: '/admin/actualites', icon: Newspaper, label: 'Actualités', desc: 'Écrire et publier des articles' },
    { href: '/admin/agenda', icon: Calendar, label: 'Agenda', desc: 'Gérer les événements à venir' },
    { href: '/admin/presentation', icon: Info, label: 'Notre institution', desc: 'Textes de présentation du PEL' },
    { href: '/admin/bureau', icon: Users, label: 'Bureau', desc: 'Membres du bureau et rôles' },
    { href: '/admin/parametres', icon: Settings, label: 'Paramètres', desc: 'Nom du site, email, réseaux' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>
          TABLEAU DE BORD
        </h1>
        <p className="text-gray-500 mt-1 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>
          Gérez le contenu du site du Parlement des Étudiants de Lyon.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#04439a] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--pel-bleu-light)' }}>
              <Icon size={22} style={{ color: 'var(--pel-bleu)' }} />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-[#04439a] transition-colors" style={{ fontFamily: 'var(--font-corps)' }}>{label}</p>
            <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl border border-blue-100" style={{ background: 'var(--pel-bleu-light)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--pel-bleu)', fontFamily: 'var(--font-corps)' }}>
          💡 <strong>Hémicycle automatique</strong> — La composition de l&apos;hémicycle visible sur le site est automatiquement liée aux parlementaires que vous gérez dans votre{' '}
          <Link href="/administration/parlementaires" className="underline">espace parlementaire</Link>.
          Toute modification s&apos;y reflète en temps réel.
        </p>
      </div>
    </div>
  )
}
