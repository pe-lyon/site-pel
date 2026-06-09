/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Empêche le chargement de la page dans une iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Empêche les navigateurs de deviner le type MIME
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Contrôle les infos envoyées dans le header Referer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Désactive les fonctionnalités sensibles du navigateur
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Force HTTPS (1 an, inclut sous-domaines)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Active le filtre XSS intégré des anciens navigateurs
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
