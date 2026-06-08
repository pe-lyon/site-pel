import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fond persistant avec orbs — visible derrière tout le site */}
      <div className="site-bg-layer" aria-hidden="true">
        <div className="site-orb site-orb-1" />
        <div className="site-orb site-orb-2" />
        <div className="site-orb site-orb-3" />
        <div className="site-orb site-orb-4" />
        <div className="site-orb site-orb-5" />
      </div>

      <Header />
      <main className="pt-16 lg:pt-20 relative z-10">
        {children}
      </main>
      <Footer />
    </>
  )
}
