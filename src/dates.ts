export function todayId(now = new Date()): string {
  return toDateId(now)
}

export function toDateId(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateId(id: string): Date {
  const [y, m, d] = id.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(id: string, days: number): string {
  const d = parseDateId(id)
  d.setDate(d.getDate() + days)
  return toDateId(d)
}

export function lastDays(count: number, end = todayId()): string[] {
  const ids: string[] = []
  for (let i = count - 1; i >= 0; i--) ids.push(addDays(end, -i))
  return ids
}

export function startOfWeek(id: string): string {
  const d = parseDateId(id)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateId(d)
}

export function startOfMonth(id: string): string {
  const d = parseDateId(id)
  d.setDate(1)
  return toDateId(d)
}

export function weekdayShort(id: string): string {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(parseDateId(id))
}

export function formatDayLong(id: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseDateId(id))
}

export function formatDayMedium(id: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(parseDateId(id))
}

export function isToday(id: string): boolean {
  return id === todayId()
}
