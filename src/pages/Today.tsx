import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddSheet } from '../components/AddSheet'
import { EntryRow } from '../components/NutrientPanel'
import { BackLink } from '../components/Nav'
import { useDayTotals } from '../data'
import { formatDayLong, isToday, todayId } from '../dates'
import { forGrams, formatKcal, formatMacro } from '../nutrition'

export function Today() {
  const params = useParams()
  const date = params.date ?? todayId()
  const today = isToday(date)
  const { dayEntries, kcal, protein, carbs, fat } = useDayTotals(date)
  const [adding, setAdding] = useState(false)

  return (
    <main className="page">
      {!today ? <BackLink to="/verlauf">Verlauf</BackLink> : null}
      <header className="hero">
        <p className="hero-label">{today ? 'kcal heute' : formatDayLong(date)}</p>
        <p className="hero-kcal">{formatKcal(kcal)}</p>
        <div className="hero-macros">
          <span>
            <strong>{formatMacro(protein)}</strong> P
          </span>
          <span>
            <strong>{formatMacro(carbs)}</strong> K
          </span>
          <span>
            <strong>{formatMacro(fat)}</strong> F
          </span>
        </div>
      </header>

      {dayEntries.length === 0 ? (
        <p className="empty">Noch nichts eingetragen.</p>
      ) : (
        <ul className="entry-list">
          {dayEntries.map((entry) => {
            const n = forGrams(entry.per100g, entry.grams)
            return (
              <li key={entry.id}>
                <Link to={`/eintrag/${entry.id}`} className="entry-link">
                  <EntryRow name={entry.name} grams={entry.grams} kcal={n.kcal} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <button type="button" className="fab" onClick={() => setAdding(true)} aria-label="Hinzufügen">
        +
      </button>
      {adding ? <AddSheet date={date} onClose={() => setAdding(false)} /> : null}
    </main>
  )
}
