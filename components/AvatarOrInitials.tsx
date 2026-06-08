interface AvatarOrInitialsProps {
  avatarUrl?: string | null
  firstName: string
  lastName: string
  color?: string
  size?: number
  className?: string
}

export default function AvatarOrInitials({
  avatarUrl,
  firstName,
  lastName,
  color = '#04439a',
  size = 32,
  className = '',
}: AvatarOrInitialsProps) {
  const initials = `${firstName?.charAt(0) ?? '?'}${lastName?.charAt(0) ?? ''}`

  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{
          color: 'white', fontWeight: 700,
          fontSize: `${Math.round(size * 0.35)}px`,
        }}>
          {initials}
        </span>
      )}
    </div>
  )
}
