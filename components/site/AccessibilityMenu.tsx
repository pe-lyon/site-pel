'use client'
import { useState, useEffect } from 'react'
import { Accessibility } from 'lucide-react'

type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [colorblind, setColorblind] = useState<ColorblindMode>('none')
  const [dyslexic, setDyslexic] = useState(false)

  // Restore preferences on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem('pel-theme')
      const c = localStorage.getItem('pel-colorblind') as ColorblindMode | null
      const d = localStorage.getItem('pel-dyslexic')
      if (t === 'dark') setDarkMode(true)
      if (c && c !== 'none') setColorblind(c)
      if (d === 'true') setDyslexic(true)
    } catch {}
  }, [])

  // Apply dark mode
  useEffect(() => {
    const html = document.documentElement
    if (darkMode) {
      html.setAttribute('data-theme', 'dark')
      localStorage.setItem('pel-theme', 'dark')
    } else {
      html.removeAttribute('data-theme')
      localStorage.setItem('pel-theme', 'light')
    }
  }, [darkMode])

  // Apply colorblind mode
  useEffect(() => {
    const html = document.documentElement
    if (colorblind && colorblind !== 'none') {
      html.setAttribute('data-colorblind', colorblind)
    } else {
      html.removeAttribute('data-colorblind')
    }
    localStorage.setItem('pel-colorblind', colorblind)
  }, [colorblind])

  // Apply dyslexic mode
  useEffect(() => {
    const html = document.documentElement
    if (dyslexic) {
      html.setAttribute('data-dyslexic', 'true')
      localStorage.setItem('pel-dyslexic', 'true')
    } else {
      html.removeAttribute('data-dyslexic')
      localStorage.setItem('pel-dyslexic', 'false')
    }
  }, [dyslexic])

  return (
    <div
      id="accessibility-menu"
      style={{
        position: 'fixed',
        bottom: '5.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Panel */}
      {open && (
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 8px 32px rgba(4,67,154,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: '1rem',
            padding: '1rem',
            maxWidth: '240px',
            width: '240px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-corps)', fontWeight: 600, fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Accessibilité
          </p>

          {/* Dark mode */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.75rem', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌙 Mode sombre
            </span>
            <button
              role="switch"
              aria-checked={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '999px',
                background: darkMode ? 'var(--pel-bleu)' : '#d1d5db',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: darkMode ? '20px' : '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                transition: 'left 0.2s',
              }} />
            </button>
          </label>

          {/* Colorblind mode */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              👁 Mode daltonien
            </span>
            <select
              value={colorblind}
              onChange={e => setColorblind(e.target.value as ColorblindMode)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1.5px solid rgba(4,67,154,0.20)',
                background: 'rgba(255,255,255,0.80)',
                fontFamily: 'var(--font-corps)',
                fontSize: '0.8rem',
                color: '#374151',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="none">Désactivé</option>
              <option value="deuteranopia">Deutéranopie (vert-rouge)</option>
              <option value="protanopia">Protanopie (rouge)</option>
              <option value="tritanopia">Tritanopie (bleu-jaune)</option>
            </select>
          </div>

          {/* Dyslexic mode */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-corps)', fontSize: '0.875rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong>Aa</strong> Mode dyslexique
            </span>
            <button
              role="switch"
              aria-checked={dyslexic}
              onClick={() => setDyslexic(!dyslexic)}
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '999px',
                background: dyslexic ? 'var(--pel-bleu)' : '#d1d5db',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: dyslexic ? '20px' : '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                transition: 'left 0.2s',
              }} />
            </button>
          </label>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Options d'accessibilité"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '999px',
          background: open ? 'var(--pel-bleu)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 4px 16px rgba(4,67,154,0.14)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? 'white' : 'var(--pel-bleu)',
          transition: 'background 0.2s, color 0.2s, transform 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
      >
        <Accessibility size={20} />
      </button>
    </div>
  )
}
