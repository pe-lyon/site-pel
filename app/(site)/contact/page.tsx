'use client'
import { useState } from 'react'
import { Mail, MapPin, Instagram, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'
import SiteHero from '@/components/site/SiteHero'

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', objet: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Message envoyé avec succès !')
    setForm({ nom: '', email: '', objet: '', message: '' })
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.70)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255,255,255,0.80)',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    width: '100%',
    outline: 'none',
    fontFamily: 'var(--font-corps)',
    fontSize: '0.95rem',
    color: '#1f2937',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div>
      <SiteHero
        badge="Nous contacter"
        title="Contact"
        description="Une question ? Une suggestion ? Écrivez-nous."
      />

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Formulaire */}
            <div
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.75)',
                boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                borderRadius: '1rem',
                padding: '2rem',
              }}
            >
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ENVOYEZ-NOUS UN MESSAGE</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nom</label>
                    <input style={inputStyle} placeholder="Votre nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" style={inputStyle} placeholder="votre@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="label">Objet</label>
                  <input style={inputStyle} placeholder="Objet de votre message" value={form.objet} onChange={e => setForm({...form, objet: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea style={{ ...inputStyle, resize: 'none' }} rows={5} placeholder="Votre message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Envoi...' : 'Envoyer le message →'}
                </button>
              </form>
            </div>

            {/* Coordonnées */}
            <div className="space-y-8">
              <div
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                  borderRadius: '1rem',
                  padding: '2rem',
                }}
              >
                <h2 className="mb-6" style={{ fontFamily: 'var(--font-titre)', fontSize: '2rem', color: 'var(--pel-bleu)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NOS COORDONNÉES</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pel-bleu-light)' }}>
                      <Mail size={18} style={{ color: 'var(--pel-bleu)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>Email</p>
                      <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>communication.pelyon@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pel-bleu-light)' }}>
                      <MapPin size={18} style={{ color: 'var(--pel-bleu)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-corps)' }}>Adresse</p>
                      <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-corps)' }}>Université de Lyon, Métropole lyonnaise</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  boxShadow: '0 4px 24px rgba(4,67,154,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                  borderRadius: '1rem',
                  padding: '2rem',
                }}
              >
                <p className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-corps)' }}>Réseaux sociaux</p>
                <div className="flex gap-3">
                  <a href="https://instagram.com/pel_lyon" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/60 hover:border-[#04439a] transition-colors text-sm bg-white/40" style={{ fontFamily: 'var(--font-corps)' }}>
                    <Instagram size={16} /> Instagram
                  </a>
                  <a href="https://linkedin.com/company/pel-lyon" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/60 hover:border-[#04439a] transition-colors text-sm bg-white/40" style={{ fontFamily: 'var(--font-corps)' }}>
                    <Linkedin size={16} /> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
