import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import AccessibilityMenu from '@/components/site/AccessibilityMenu'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* SVG colorblind filters — hidden */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="cb-deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
          </filter>
          <filter id="cb-protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
          </filter>
          <filter id="cb-tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
          </filter>
        </defs>
      </svg>

      {/* Fond persistant avec orbs — visible derrière tout le site */}
      <div className="site-bg-layer" aria-hidden="true">
        <div className="site-orb site-orb-1" />
        <div className="site-orb site-orb-2" />
        <div className="site-orb site-orb-3" />
        <div className="site-orb site-orb-4" />
        <div className="site-orb site-orb-5" />
      </div>

      <Header />
      <main className="relative z-10" style={{ background: 'transparent' }}>
        {children}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <AccessibilityMenu />
    </>
  )
}
