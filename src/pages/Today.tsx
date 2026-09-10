import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddSheet } from '../components/AddSheet'
import { GoalEditor, GoalLine, MacroBars } from '../components/GoalEditor'
import { EntryRow, NutrientPanel } from '../components/NutrientPanel'
import { BackLink } from '../components/Nav'
import { useDayTotals } from '../data'
import { formatDayLong, isToday, todayId } from '../dates'
import { macroTargets, useGoals } from '../goal'
import { forGrams, formatKcal } from '../nutrition'

export function Today() {
  const params = useParams()
  const date = params.date ?? todayId()
  const today = isToday(date)
  const { dayEntries, dayActivities, nutrients, burned, kcal, protein, carbs, fat } = useDayTotals(date)
  const [adding, setAdding] = useState(false)
  const { goals, setGoals } = useGoals()
  const targets = macroTargets(goals, burned)
  const micros = nutrients.vitamins.filter((v) => v.value > 0)
  const empty = dayEntries.length === 0 && dayActivities.length === 0

  return (
    <main className="page">
      {!today ? <BackLink to="/verlauf">Verlauf</BackLink> : null}
      <header className="hero">
        <div className="hero-top">
          <p className="hero-label">{today ? 'kcal heute' : formatDayLong(date)}</p>
          <GoalEditor goals={goals} onSave={setGoals} />
        </div>
        <p className="hero-kcal">{formatKcal(kcal)}</p>
        <div className="balance">
          <div>
            <span>Essen</span>
            <strong>{formatKcal(kcal)}</strong>
          </div>
          <div className="sport">
            <span>Sport</span>
            <strong>{burned > 0 ? `−${formatKcal(burned)}` : '—'}</strong>
          </div>
        </div>
        <GoalLine kcal={kcal} goal={goals.kcal} burned={burned} />
        <MacroBars
          protein={protein}
          carbs={carbs}
          fat={fat}
          targets={targets}
          custom={goals}
        />
      </header>

      {empty ? (
        <p className="empty">{today ? 'Noch nichts eingetragen.' : 'Nichts an diesem Tag. Unten nachtragen.'}</p>
      ) : null}

      {dayActivities.length > 0 ? (
        <>
          <h2 className="section-label">Sport</h2>
          <ul className="entry-list">
            {dayActivities.map((activity) => (
              <li key={activity.id}>
                <Link to={`/sport/${activity.id}`} className="entry-link sport-link">
                  <EntryRow
                    name={activity.name}
                    grams={activity.minutes}
                    kcal={-activity.kcal}
                    meta={activity.minutes > 0 ? `${activity.minutes} min` : 'Sport'}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {dayEntries.length > 0 ? (
        <>
          <h2 className="section-label">Essen</h2>
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
        </>
      ) : null}

      {micros.length > 0 || nutrients.fiber > 0.05 || nutrients.sugar > 0.05 || nutrients.salt > 0.005 ? (
        <details className="day-details">
          <summary>Nährwerte &amp; Mikronährstoffe</summary>
          <NutrientPanel nutrients={nutrients} targets={targets} />
        </details>
      ) : null}

      <button type="button" className="fab" onClick={() => setAdding(true)} aria-label="Hinzufügen">
        +
      </button>
      {adding ? <AddSheet date={date} onClose={() => setAdding(false)} /> : null}
    </main>
  )
}
