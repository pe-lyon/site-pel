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
  { text: 'des étudiants engagés.', pauseMs: 2200 },
  { text: 'une institution démocratique.', pauseMs: 2200 },
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
    <p style={{
      fontFamily: 'var(--font-corps)',
      fontSize: 'clamp(1.05rem, 2.2vw, 1.35rem)',
      color: 'rgba(255,255,255,0.90)',
      marginBottom: '2.5rem',
      minHeight: '2.2em',
      transition: 'font-size 0.3s',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>Nous sommes </span>
      <span style={{
        fontWeight: isHighlight ? 700 : 600,
        color: isHighlight ? 'white' : 'rgba(255,255,255,0.95)',
        textShadow: isHighlight ? '0 0 30px rgba(255,255,255,0.35)' : 'none',
        transition: 'color 0.4s, text-shadow 0.4s',
      }}>
        {displayed}
      </span>
      <span style={{
        display: 'inline-block',
        width: '2px',
        height: '1em',
        background: 'rgba(255,255,255,0.85)',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
        animation: 'blink 1s step-end infinite',
      }} />
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </p>
  )
}
