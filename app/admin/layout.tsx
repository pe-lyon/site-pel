// Layout minimal pour /admin — pas d'auth check ici.
// L'auth est gérée dans app/admin/(panel)/layout.tsx
// Cela permet à /admin/login d'être accessible sans redirection infinie.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
