import styles from './Avatar.module.css'
import type { Character } from '../types'

interface Props {
  character: Character
  size?: number
  ring?: boolean
}

export function Avatar({ character, size = 40, ring = false }: Props) {
  const initials = getInitials(character)
  const fontSize = Math.round(size * 0.42)

  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize,
        // @ts-expect-error CSS custom property
        '--bg': character.color,
      }}
      aria-label={character.name}
      title={character.name}
    >
      {character.photoURL
        ? <img src={character.photoURL} alt={character.name} />
        : <span>{initials}</span>}
      {ring && <span className={styles.ring} aria-hidden />}
    </span>
  )
}

function getInitials(c: Character): string {
  // Per i personaggi tipo "El Pertega" — prendiamo l'iniziale della parola
  // più distintiva (saltiamo "El", "El(r)", articoli)
  const skip = new Set(['el', 'el(r)', 'il', 'la', 'lo', 'de', 'del', 'mas'])
  const words = c.name.split(/\s+/).filter(w => !skip.has(w.toLowerCase()))
  if (words.length === 0) return c.name[0]?.toUpperCase() ?? '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
