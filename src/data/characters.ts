import type { Character } from '../types'

export const CHARACTERS: Character[] = [
  {
    id: 'pertega',
    name: 'El Pertega',
    nickname: "L'Aquila",
    motto: 'Volo alto, atterro male.',
    color: '#C0392B',
    emoji: '🦅',
  },
  {
    id: 'bronto',
    name: 'El Bronto',
    nickname: 'Il Tonante',
    motto: 'Estinto ma carismatico.',
    color: '#8E44AD',
    emoji: '🦕',
  },
  {
    id: 'maje',
    name: 'El Maje',
    nickname: 'Il Maestro',
    motto: 'Sapienza in fermentazione.',
    color: '#16A085',
    emoji: '🧙‍♂️',
  },
  {
    id: 'forcio',
    name: 'El mas forcio',
    nickname: 'Teo',
    motto: 'Bracciate prima di pensare.',
    color: '#D35400',
    emoji: '💪',
  },
  {
    id: 'grosso',
    name: 'El mas grosso',
    nickname: 'Giobbo',
    motto: 'Massa volumetrica imbattibile.',
    color: '#27AE60',
    emoji: '🐻',
  },
  {
    id: 'denisio',
    name: 'El Denisio',
    nickname: 'Il Misterioso',
    motto: "Più assente che presente, vince comunque.",
    color: '#2C3E50',
    emoji: '🎩',
  },
  {
    id: 'colosseo',
    name: 'El(r) meglio del colosseo',
    nickname: 'Romeone',
    motto: 'Ave Caesar, morituri te salutant.',
    color: '#B7950B',
    emoji: '🏛️',
  },
]

export const CHARACTERS_BY_ID = Object.fromEntries(
  CHARACTERS.map(c => [c.id, c]),
) as Record<string, Character>
