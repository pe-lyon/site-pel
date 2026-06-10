'use client'

import { useState, useEffect } from 'react'

const PHRASES = [
  'des étudiants engagés.',
  'le Parlement des Étudiants de Lyon.',
  'une institution démocratique.',
  'des parlementaires, pas des spectateurs.',
  'la voix estudiantine lyonnaise.',
  'un laboratoire de démocratie.',
]

export default function TypewriterText() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true) }, 2200)
      return () => clearTimeout(t)
    }

    const current = PHRASES[phraseIdx]

    if (!deleting) {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 45)
        return () => clearTimeout(t)
      } else {
        setPaused(true)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25)
        return () => clearTimeout(t)
      } else {
        setDeleting(false)
        setPhraseIdx(i => (i + 1) % PHRASES.length)
      }
    }
  }, [displayed, deleting, paused, phraseIdx])

  return (
    <p style={{
      fontFamily: 'var(--font-corps)',
      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
      color: 'rgba(255,255,255,0.90)',
      marginBottom: '2.5rem',
      minHeight: '2em',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>Nous sommes </span>
      <span style={{ fontWeight: 600 }}>{displayed}</span>
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1.1em',
          background: 'rgba(255,255,255,0.8)',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
        }}
      />
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </p>
  )
}
