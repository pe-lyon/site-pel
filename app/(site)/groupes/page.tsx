export const revalidate = 60

export default function GroupesPage() {
  return (
    <div>
      <section
        style={{
          background: 'var(--pel-bleu)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="py-20"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="animate-orb" style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(60px)', top: '-80px', right: '10%' }} />
          <div className="animate-orb-reverse" style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)', bottom: '-60px', left: '5%' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-blue-200 text-sm mb-2" style={{ fontFamily: 'var(--font-corps)' }}>Composition de l&apos;assemblée</p>
          <h1 className="text-white" style={{ fontFamily: 'var(--font-titre)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700 }}>GROUPES POLITIQUES</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '3rem',
            }}
          >
            <h2 className="mb-6 text-center" style={{ fontFamily: 'var(--font-titre)', fontSize: '1.8rem', color: 'var(--pel-bleu)', fontWeight: 700 }}>COMPOSITION DE L&apos;HÉMICYCLE</h2>
            <svg viewBox="0 0 1000 500" className="w-full" style={{ maxHeight: 400 }}>
              <path d="M 80 420 A 420 420 0 0 1 920 420" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
              <path d="M 140 420 A 360 360 0 0 1 860 420" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
              <path d="M 200 420 A 300 300 0 0 1 800 420" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
              <path d="M 260 420 A 240 240 0 0 1 740 420" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
              <text x="90" y="415" textAnchor="middle" fill="#9ca3af" fontSize="10" fontStyle="italic">Gauche</text>
              <text x="910" y="415" textAnchor="middle" fill="#9ca3af" fontSize="10" fontStyle="italic">Droite</text>
              <ellipse cx="500" cy="435" rx="65" ry="25" fill="#04439a"/>
              <text x="500" y="440" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">PRÉSIDENCE</text>
            </svg>
            <p className="text-center text-gray-500 text-sm mt-4" style={{ fontFamily: 'var(--font-corps)' }}>
              L&apos;hémicycle complet avec les parlementaires est visible depuis l&apos;
              <a href="/seance" className="text-[#04439a] underline">espace séance</a>.
            </p>
          </div>

          <p className="text-gray-500 text-center" style={{ fontFamily: 'var(--font-corps)' }}>
            Les groupes politiques sont gérés depuis la plateforme parlementaire. Connectez-vous pour voir la composition complète.
          </p>
        </div>
      </section>
    </div>
  )
}
