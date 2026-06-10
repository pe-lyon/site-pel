'use client'

import { useState, useEffect } from 'react'

interface Phrase {
  text: string
  pauseMs: number   // durée d'affichage avant effacement
  highlight?: boolean
}

const PHRASES: Phrase[] = [
  {
    text: "l'institution parlementaire étudiante de référence à Lyon.",
    pauseMs: 5000,
    highlight: true,
  },
  { text: 'une association apartisane.', pauseMs: 2800 },
  { text: 'engagés, sans ligne politique imposée.', pauseMs: 2800 },
  { text: 'des étudiants qui croient en la démocratie.', pauseMs: 2800 },
  { text: 'là pour réconcilier les jeunes avec la politique.', pauseMs: 3000 },
  { text: 'des parlementaires, pas des spectateurs.', pauseMs: 2500 },
  { text: 'un laboratoire de démocratie.', pauseMs: 2200 },
]

export default function TypewriterText() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [paused, setPaused] = useState(false)

  const current = PHRASES[phraseIdx]

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true) }, current.pauseMs)
      return () => clearTimeout(t)
    }

    if (!deleting) {
      if (displayed.length < current.text.length) {
        const t = setTimeout(() => setDisplayed(current.text.slice(0, displayed.length + 1)), 42)
        return () => clearTimeout(t)
      } else {
        setPaused(true)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22)
        return () => clearTimeout(t)
      } else {
        setDeleting(false)
        setPhraseIdx(i => (i + 1) % PHRASES.length)
      }
    }
  }, [displayed, deleting, paused, phraseIdx, current])

  const isHighlight = current.highlight && !deleting

  return (
    <div style={{ marginBottom: '2.5rem', minHeight: '3.5em' }}>
      <p style={{
        fontFamily: 'var(--font-corps)',
        fontSize: isHighlight ? 'clamp(1.15rem, 2.6vw, 1.6rem)' : 'clamp(1.05rem, 2.2vw, 1.35rem)',
        color: 'rgba(255,255,255,0.90)',
        margin: 0,
        transition: 'font-size 0.4s ease',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.50)', fontWeight: 400 }}>Nous sommes </span>
        {isHighlight ? (
          <span style={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #fff 0%, #fde68a 40%, #fbbf24 70%, #fff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 3s linear infinite',
          }}>
            {displayed}
          </span>
        ) : (
          <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
            {displayed}
          </span>
        )}
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '0.9em',
          background: isHighlight ? '#fbbf24' : 'rgba(255,255,255,0.85)',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
        }} />
      </p>

      {/* Ligne décorative sous la phrase principale */}
      <div style={{
        height: '2px',
        width: isHighlight ? '100%' : '0%',
        background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
        borderRadius: '999px',
        marginTop: '0.5rem',
        transition: 'width 1s ease',
        maxWidth: '480px',
      }} />

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
    </div>
  )
}
