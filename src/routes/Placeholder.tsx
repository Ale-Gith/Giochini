interface Props {
  title: string
  subtitle?: string
}

export function Placeholder({ title, subtitle }: Props) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '0.75rem',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 6vw, 4rem)',
        margin: 0,
        color: 'var(--bordeaux)',
      }}>{title}</h1>
      {subtitle && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--ink-soft)',
          margin: 0,
        }}>{subtitle}</p>
      )}
    </div>
  )
}
