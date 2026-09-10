import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddSheet } from '../components/AddSheet'
import { GoalEditor, GoalLine } from '../components/GoalEditor'
import { EntryRow, NutrientPanel } from '../components/NutrientPanel'
import { BackLink } from '../components/Nav'
import { useDayTotals } from '../data'
import { formatDayLong, isToday, todayId } from '../dates'
import { useKcalGoal } from '../goal'
import { forGrams, formatKcal, formatMacro } from '../nutrition'

export function Today() {
  const params = useParams()
  const date = params.date ?? todayId()
  const today = isToday(date)
  const { dayEntries, nutrients, kcal, protein, carbs, fat } = useDayTotals(date)
  const [adding, setAdding] = useState(false)
  const { goal, setGoal } = useKcalGoal()
  const micros = nutrients.vitamins.filter((v) => v.value > 0)

  return (
    <main className="page">
      {!today ? <BackLink to="/verlauf">Verlauf</BackLink> : null}
      <header className="hero">
        <div className="hero-top">
          <p className="hero-label">{today ? 'kcal heute' : formatDayLong(date)}</p>
          <GoalEditor goal={goal} onSave={setGoal} />
        </div>
        <p className="hero-kcal">{formatKcal(kcal)}</p>
        <GoalLine kcal={kcal} goal={goal} />
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
        <p className="empty">{today ? 'Noch nichts eingetragen.' : 'Nichts an diesem Tag. Unten nachtragen.'}</p>
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

      {micros.length > 0 || nutrients.fiber > 0.05 || nutrients.sugar > 0.05 || nutrients.salt > 0.005 ? (
        <details className="day-details">
          <summary>Nährwerte &amp; Mikronährstoffe</summary>
          <NutrientPanel nutrients={nutrients} />
        </details>
      ) : null}

      <button type="button" className="fab" onClick={() => setAdding(true)} aria-label="Hinzufügen">
        +
      </button>
      {adding ? <AddSheet date={date} onClose={() => setAdding(false)} /> : null}
    </main>
  )
}
