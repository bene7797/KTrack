import type { ReactNode } from 'react'

export type IconName =
  | 'scan'
  | 'search'
  | 'bowl'
  | 'chef'
  | 'run'
  | 'bike'
  | 'walk'
  | 'dumbbell'
  | 'swim'
  | 'hike'
  | 'yoga'
  | 'food'
  | 'sun'
  | 'chart'
  | 'plus'

const icons: Record<IconName, ReactNode> = {
  scan: (
    <>
      <path d="M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2" />
      <path d="M8 8v8M11 8v8M14 8v8M17 8v8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.4-3.4" />
    </>
  ),
  bowl: (
    <>
      <path d="M4 10h16a8 8 0 0 1-16 0Z" />
      <path d="M8 6c.6-1.6 1.8-2.6 4-2.6s3.4 1 4 2.6" />
    </>
  ),
  chef: (
    <>
      <path d="M8 11h8v9H8z" />
      <path d="M7 11c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M12 6V3" />
    </>
  ),
  run: (
    <>
      <circle cx="14" cy="5" r="2" />
      <path d="M5 21 9.2 14.8l2.3 2L15 21" />
      <path d="M9.2 14.8 8 10l5.5-2 1.8 4.2" />
    </>
  ),
  bike: (
    <>
      <circle cx="6.5" cy="14.5" r="3.2" />
      <circle cx="17.5" cy="14.5" r="3.2" />
      <path d="M12 6.5 13.8 12h4M12 6.5H9.2L12 12M11.2 12 7.4 14" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="5" r="2" />
      <path d="M8 21l3-7 3 2 3 5" />
      <path d="M11 14 10 9l4-1 1 4" />
    </>
  ),
  dumbbell: <path d="M6 8v8M18 8v8M4 10v4M20 10v4M6 12h12" />,
  swim: (
    <>
      <path d="M4 17c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0" />
      <circle cx="16" cy="6" r="2" />
      <path d="M8 13.5 11 10l3 2 3-2" />
    </>
  ),
  hike: (
    <>
      <path d="M4 20 10 10l3 5 3-4 4 9" />
      <circle cx="13" cy="5" r="2" />
    </>
  ),
  yoga: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 8v5M8 21l4-8 4 8M8 13h8" />
    </>
  ),
  food: (
    <>
      <path d="M6 3v8a2 2 0 0 1-2 2H4" />
      <path d="M6 3v18" />
      <path d="M16 3v11a3 3 0 0 0 3 3V3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 4v1.6M12 18.4V20M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M4 12h1.6M18.4 12H20M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
    </>
  ),
  chart: <path d="M5 19h14M8 16V10M12 16V7M16 16v-4" />,
  plus: <path d="M12 5v14M5 12h14" />,
}

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

export function sportIcon(name: string): IconName {
  const n = name.toLowerCase()
  if (n.includes('rad')) return 'bike'
  if (n.includes('lauf') || n.includes('jog')) return 'run'
  if (n.includes('geh') || n.includes('spazier')) return 'walk'
  if (n.includes('kraft') || n.includes('gym') || n.includes('hantel')) return 'dumbbell'
  if (n.includes('schwimm')) return 'swim'
  if (n.includes('wander')) return 'hike'
  if (n.includes('yoga') || n.includes('dehn')) return 'yoga'
  return 'run'
}
