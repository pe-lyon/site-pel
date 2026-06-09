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

  useEffect(() => {
    // Si pas de clé configurée, on ne charge rien
    if (!siteKey || siteKey === 'CONFIGURE_ME') return
    if (!containerRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return
      if (widgetIdRef.current) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: onVerify,
        'error-callback': onError,
      })
    }

    const existingScript = document.getElementById('cf-turnstile-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
    } else if (window.turnstile) {
      renderWidget()
    } else {
      existingScript.addEventListener('load', renderWidget)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
    }
  }, [siteKey, onVerify, onError])

  // Si pas de clé, ne rien afficher
  if (!siteKey || siteKey === 'CONFIGURE_ME') return null

  return <div ref={containerRef} className="mt-1" />
}
