import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
    </>
  )
}
