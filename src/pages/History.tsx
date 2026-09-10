import { Link } from 'react-router-dom'
import { useData } from '../data'
import { formatDayMedium, isToday, lastDays, startOfMonth, startOfWeek, todayId, weekdayShort } from '../dates'
import { formatKcal } from '../nutrition'

function kcalForDate(entries: { date: string; grams: number; per100g: { kcal: number } }[], date: string) {
  return entries
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + (e.per100g.kcal * e.grams) / 100, 0)
}

export function History() {
  const { entries } = useData()
  const today = todayId()
  const weekDays = lastDays(7, today)
  const weekStart = startOfWeek(today)
  const monthStart = startOfMonth(today)

  const weekSum = entries
    .filter((e) => e.date >= weekStart && e.date <= today)
    .reduce((sum, e) => sum + (e.per100g.kcal * e.grams) / 100, 0)

  const monthEntries = entries.filter((e) => e.date >= monthStart && e.date <= today)
  const monthSum = monthEntries.reduce((sum, e) => sum + (e.per100g.kcal * e.grams) / 100, 0)
  const dayOfMonth = Number.parseInt(today.slice(-2), 10)
  const monthAvg = dayOfMonth > 0 ? monthSum / dayOfMonth : 0

  const dates = [...new Set(entries.map((e) => e.date))].sort((a, b) => (a < b ? 1 : -1))

  return (
    <main className="page">
      <h1 className="page-title">Verlauf</h1>
      <div className="week-strip">
        {weekDays.map((id) => {
          const kcal = kcalForDate(entries, id)
          const to = isToday(id) ? '/' : `/tag/${id}`
          return (
            <Link key={id} to={to} className={`week-cell ${isToday(id) ? 'today' : ''}`}>
              <span>{weekdayShort(id)}</span>
              <strong>{kcal > 0 ? formatKcal(kcal) : '–'}</strong>
            </Link>
          )
        })}
      </div>
      <div className="stat-row">
        <div className="stat-card">
          <span>Diese Woche</span>
          <strong>{formatKcal(weekSum)}</strong>
          <small>kcal</small>
        </div>
        <div className="stat-card">
          <span>Ø Monat</span>
          <strong>{formatKcal(monthAvg)}</strong>
          <small>kcal / Tag</small>
        </div>
      </div>
      {dates.length === 0 ? (
        <p className="empty">Noch keine Tage.</p>
      ) : (
        <ul className="plain-list">
          {dates.map((id) => {
            const kcal = kcalForDate(entries, id)
            const to = isToday(id) ? '/' : `/tag/${id}`
            return (
              <li key={id}>
                <Link to={to} className="list-btn">
                  <span>{formatDayMedium(id)}</span>
                  <small>{formatKcal(kcal)} kcal</small>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
