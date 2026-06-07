import { getBureauMembres } from '@/lib/cms'
import { getInitials } from '@/lib/utils'
import { Mail, Linkedin } from 'lucide-react'

export const revalidate = 60

export default async function BureauPage() {
  const membres = await getBureauMembres()

  return (
    <div>
      <section style={{ background: 'var(--pel-bleu)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>L&apos;équipe dirigeante</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 700 }}>LE BUREAU</h1>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--pel-creme)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {membres.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👥</p>
              <p style={{ fontFamily: 'var(--font-titre)', fontSize: '1.5rem', color: 'var(--pel-gris)', fontWeight: 700 }}>BUREAU EN COURS DE CONSTITUTION</p>
              <p className="text-gray-400 mt-2 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Les membres du bureau seront affichés ici.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {membres.map((m: any) => (
                <div key={m.id} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--pel-bleu)', fontFamily: 'var(--font-titre)' }}>
                    {m.photo_url
                      ? <img src={m.photo_url} alt={`${m.prenom} ${m.nom}`} className="w-full h-full rounded-full object-cover"/>
                      : getInitials(m.prenom, m.nom)
                    }
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-titre)', fontSize: '1.1rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>{m.prenom.toUpperCase()} {m.nom.toUpperCase()}</h3>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-corps)' }}>{m.role}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#04439a]">
                        <Mail size={16}/>
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#04439a]">
                        <Linkedin size={16}/>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
