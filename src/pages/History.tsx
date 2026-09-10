import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddSheet } from '../components/AddSheet'
import { GoalEditor, GoalLine } from '../components/GoalEditor'
import { useData } from '../data'
import { formatDayMedium, isToday, lastDays, startOfMonth, startOfWeek, todayId, weekdayShort } from '../dates'
import { useKcalGoal } from '../goal'
import { addNutrients, emptyNutrients, forGrams, formatKcal, formatMacro } from '../nutrition'
import type { LogEntry, Nutrients } from '../types'

type Metric = 'kcal' | 'protein' | 'carbs' | 'fat'

function nutrientsForDate(entries: LogEntry[], date: string): Nutrients {
  return entries
    .filter((e) => e.date === date)
    .reduce((acc, e) => addNutrients(acc, forGrams(e.per100g, e.grams)), emptyNutrients())
}

function metricValue(n: Nutrients, metric: Metric): number {
  return n[metric]
}

function metricLabel(metric: Metric): string {
  if (metric === 'kcal') return 'kcal'
  if (metric === 'protein') return 'P'
  if (metric === 'carbs') return 'K'
  return 'F'
}

function formatMetric(n: number, metric: Metric): string {
  return metric === 'kcal' ? formatKcal(n) : formatMacro(n)
}

export function History() {
  const { entries } = useData()
  const today = todayId()
  const weekDays = lastDays(7, today)
  const weekStart = startOfWeek(today)
  const monthStart = startOfMonth(today)
  const { goal, setGoal } = useKcalGoal()
  const [metric, setMetric] = useState<Metric>('kcal')
  const [adding, setAdding] = useState<string | null>(null)

  const weekNutrients = useMemo(
    () =>
      entries
        .filter((e) => e.date >= weekStart && e.date <= today)
        .reduce((acc, e) => addNutrients(acc, forGrams(e.per100g, e.grams)), emptyNutrients()),
    [entries, today, weekStart],
  )

  const monthEntries = entries.filter((e) => e.date >= monthStart && e.date <= today)
  const monthSum = monthEntries.reduce((sum, e) => sum + (e.per100g.kcal * e.grams) / 100, 0)
  const dayOfMonth = Number.parseInt(today.slice(-2), 10)
  const monthAvg = dayOfMonth > 0 ? monthSum / dayOfMonth : 0

  const daysInWeekSoFar = weekDays.filter((id) => id <= today).length
  const weekGoal = goal ? goal * daysInWeekSoFar : null
  const weekAvg = daysInWeekSoFar > 0 ? weekNutrients.kcal / daysInWeekSoFar : 0

  const dates = [...new Set([...weekDays, ...entries.map((e) => e.date)])].sort((a, b) => (a < b ? 1 : -1))

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="page-title">Verlauf</h1>
        <GoalEditor goal={goal} onSave={setGoal} />
      </header>
      <div className="metric-tabs">
        {(['kcal', 'protein', 'carbs', 'fat'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={metric === m ? 'chip on' : 'chip'}
            onClick={() => setMetric(m)}
          >
            {m === 'kcal' ? 'kcal' : m === 'protein' ? 'Protein' : m === 'carbs' ? 'Kohlenh.' : 'Fett'}
          </button>
        ))}
      </div>
      <div className="week-strip">
        {weekDays.map((id) => {
          const n = nutrientsForDate(entries, id)
          const value = metricValue(n, metric)
          const to = isToday(id) ? '/' : `/tag/${id}`
          const over = metric === 'kcal' && goal != null && value > goal + 1
          const under = metric === 'kcal' && goal != null && value > 0 && value < goal - 1
          return (
            <Link
              key={id}
              to={to}
              className={`week-cell ${isToday(id) ? 'today' : ''} ${over ? 'over' : ''} ${under ? 'under' : ''}`}
            >
              <span>{weekdayShort(id)}</span>
              <strong>{value > 0 ? formatMetric(value, metric) : '–'}</strong>
              <em>{metricLabel(metric)}</em>
            </Link>
          )
        })}
      </div>
      <div className="week-macros">
        <span>
          <strong>{formatKcal(weekNutrients.kcal)}</strong> kcal
        </span>
        <span>
          <strong>{formatMacro(weekNutrients.protein)}</strong> P
        </span>
        <span>
          <strong>{formatMacro(weekNutrients.carbs)}</strong> K
        </span>
        <span>
          <strong>{formatMacro(weekNutrients.fat)}</strong> F
        </span>
      </div>
      <div className="stat-row">
        <div className="stat-card">
          <span>Ø Woche</span>
          <strong>{formatKcal(weekAvg)}</strong>
          <small>kcal / Tag</small>
          {goal ? (
            <GoalLine kcal={weekAvg} goal={goal} />
          ) : null}
        </div>
        <div className="stat-card">
          <span>Woche gesamt</span>
          <strong>{formatKcal(weekNutrients.kcal)}</strong>
          <small>{weekGoal ? `Ziel ${formatKcal(weekGoal)}` : 'kcal'}</small>
          {weekGoal ? <GoalLine kcal={weekNutrients.kcal} goal={weekGoal} /> : null}
        </div>
      </div>
      <div className="stat-row">
        <div className="stat-card">
          <span>Ø Monat</span>
          <strong>{formatKcal(monthAvg)}</strong>
          <small>kcal / Tag</small>
        </div>
        <div className="stat-card">
          <span>Ballaststoffe</span>
          <strong>{formatMacro(weekNutrients.fiber)}</strong>
          <small>g diese Woche</small>
        </div>
      </div>
      <button type="button" className="btn" onClick={() => setAdding(todayId())}>
        Nachtragen
      </button>
      {dates.length === 0 ? (
        <p className="empty">Noch keine Tage.</p>
      ) : (
        <ul className="plain-list">
          {dates.map((id) => {
            const n = nutrientsForDate(entries, id)
            const to = isToday(id) ? '/' : `/tag/${id}`
            return (
              <li key={id}>
                <div className="day-row">
                  <Link to={to} className="list-btn">
                    <span>{formatDayMedium(id)}</span>
                    <small>
                      {n.kcal > 0
                        ? `${formatKcal(n.kcal)} kcal · ${formatMacro(n.protein)} P · ${formatMacro(n.carbs)} K · ${formatMacro(n.fat)} F`
                        : 'leer'}
                    </small>
                    {goal && n.kcal > 0 ? <GoalLine kcal={n.kcal} goal={goal} /> : null}
                  </Link>
                  <button type="button" className="text-btn" onClick={() => setAdding(id)}>
                    +
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {adding ? <AddSheet date={adding} onClose={() => setAdding(null)} /> : null}
    </main>
  )
}
