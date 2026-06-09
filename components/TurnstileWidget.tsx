'use client'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: object) => string
      remove: (widgetId: string) => void
    }
  }
}

interface Props {
  onVerify: (token: string) => void
  onError?: () => void
}

export default function TurnstileWidget({ onVerify, onError }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  // Si pas de clé configurée, on ne rend rien (token vide = pass en dev)
  if (!siteKey || siteKey === 'CONFIGURE_ME') return null

  useEffect(() => {
    if (!containerRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return
      if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: onVerify,
        'error-callback': onError,
      })
    }

    // Charger le script Turnstile si pas déjà présent
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
    } else {
      // Script déjà chargé
      if (window.turnstile) renderWidget()
      else {
        const existing = document.getElementById('cf-turnstile-script')
        if (existing) existing.addEventListener('load', renderWidget)
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [siteKey, onVerify, onError])

  return <div ref={containerRef} className="mt-1" />
}
