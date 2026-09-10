import { useState } from 'react'
import { hasMacroTargets, recommendedMacros, type Goals, type MacroTargets } from '../goal'
import { formatKcal, formatMacro } from '../nutrition'

type EditorProps = {
  goals: Goals
  onSave: (goals: Goals) => void
}

function parseField(raw: string): number | null {
  const n = Number.parseInt(raw.replace(/\D/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function GoalEditor({ goals, onSave }: EditorProps) {
  const [open, setOpen] = useState(false)
  const [kcal, setKcal] = useState(goals.kcal ? String(goals.kcal) : '')
  const [protein, setProtein] = useState(goals.protein ? String(goals.protein) : '')
  const [carbs, setCarbs] = useState(goals.carbs ? String(goals.carbs) : '')
  const [fat, setFat] = useState(goals.fat ? String(goals.fat) : '')

  const fill = () => {
    setKcal(goals.kcal ? String(goals.kcal) : '')
    setProtein(goals.protein ? String(goals.protein) : '')
    setCarbs(goals.carbs ? String(goals.carbs) : '')
    setFat(goals.fat ? String(goals.fat) : '')
  }

  const hintKcal = parseField(kcal)
  const rec = hintKcal ? recommendedMacros(hintKcal) : null
  const hasAny = goals.kcal != null || goals.protein != null || goals.carbs != null || goals.fat != null

  if (!open) {
    return (
      <button
        type="button"
        className="text-btn"
        onClick={() => {
          fill()
          setOpen(true)
        }}
      >
        {goals.kcal
          ? `Ziel ${formatKcal(goals.kcal)}`
          : hasAny
            ? 'Ziele'
            : 'Ziel setzen'}
      </button>
    )
  }

  return (
    <form
      className="goal-panel"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          kcal: parseField(kcal),
          protein: parseField(protein),
          carbs: parseField(carbs),
          fat: parseField(fat),
        })
        setOpen(false)
      }}
    >
      <label>
        kcal
        <input
          inputMode="numeric"
          value={kcal}
          placeholder="2200"
          onChange={(e) => setKcal(e.target.value)}
          aria-label="Tägliches kcal-Ziel"
        />
      </label>
      <div className="goal-macros">
        <label>
          Protein g
          <input
            inputMode="numeric"
            value={protein}
            placeholder={rec ? String(rec.protein) : ''}
            onChange={(e) => setProtein(e.target.value)}
            aria-label="Proteinziel in Gramm"
          />
        </label>
        <label>
          Kohlenh. g
          <input
            inputMode="numeric"
            value={carbs}
            placeholder={rec ? String(rec.carbs) : ''}
            onChange={(e) => setCarbs(e.target.value)}
            aria-label="Kohlenhydrateziel in Gramm"
          />
        </label>
        <label>
          Fett g
          <input
            inputMode="numeric"
            value={fat}
            placeholder={rec ? String(rec.fat) : ''}
            onChange={(e) => setFat(e.target.value)}
            aria-label="Fettziel in Gramm"
          />
        </label>
      </div>
      <p className="hint">Leer = Empfehlung aus kcal (20 / 50 / 30 %)</p>
      <div className="goal-edit">
        <button type="submit" className="btn small primary">
          OK
        </button>
        {hasAny ? (
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              onSave({ kcal: null, protein: null, carbs: null, fat: null })
              setOpen(false)
            }}
          >
            Weg
          </button>
        ) : null}
        <button type="button" className="text-btn" onClick={() => setOpen(false)}>
          Abbruch
        </button>
      </div>
    </form>
  )
}

export function GoalLine({
  kcal,
  goal,
  burned = 0,
}: {
  kcal: number
  goal: number | null
  burned?: number
}) {
  if (!goal && burned <= 0) return null
  if (!goal) {
    return (
      <p className="goal-line sport">
        <strong>−{formatKcal(burned)}</strong> Sport
      </p>
    )
  }
  const effective = goal + burned
  const remain = effective - kcal
  const eatenPct = effective > 0 ? Math.min(100, (kcal / effective) * 100) : 0
  const sportPct = effective > 0 ? (burned / effective) * 100 : 0
  const over = remain < 0

  return (
    <div className={`goal-block ${over ? 'over' : ''}`}>
      {over ? (
        <p className="goal-line over">
          <strong>{formatKcal(-remain)}</strong> über Ziel
        </p>
      ) : (
        <p className="goal-line">
          noch <strong>{formatKcal(remain)}</strong>
        </p>
      )}
      <div className="goal-bar" aria-hidden="true">
        {burned > 0 ? <span className="goal-bar-sport" style={{ width: `${sportPct}%` }} /> : null}
        <span className="goal-bar-fill" style={{ width: `${eatenPct}%` }} />
      </div>
      {burned > 0 ? (
        <p className="goal-cap">
          Ziel {formatKcal(goal)} <span>+ {formatKcal(burned)} Sport</span>
        </p>
      ) : null}
    </div>
  )
}

const MACRO_ROWS = [
  { key: 'protein' as const, short: 'P', label: 'Protein' },
  { key: 'carbs' as const, short: 'K', label: 'Kohlenh.' },
  { key: 'fat' as const, short: 'F', label: 'Fett' },
]

export function MacroBars({
  protein,
  carbs,
  fat,
  targets,
  custom,
}: {
  protein: number
  carbs: number
  fat: number
  targets: MacroTargets
  custom?: Pick<Goals, 'protein' | 'carbs' | 'fat'>
}) {
  const values = { protein, carbs, fat }
  if (!hasMacroTargets(targets)) {
    return (
      <div className="hero-macros">
        {MACRO_ROWS.map((row) => (
          <span key={row.key}>
            <strong>{formatMacro(values[row.key])}</strong> {row.short}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="macro-bars">
      {MACRO_ROWS.map((row) => {
        const value = values[row.key]
        const target = targets[row.key]
        if (target == null) {
          return (
            <div key={row.key} className="macro-bar-row">
              <div className="macro-bar-head">
                <span>{row.label}</span>
                <strong>{formatMacro(value)} g</strong>
              </div>
            </div>
          )
        }
        const remain = target - value
        const over = remain < -0.5
        const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
        const own = custom?.[row.key] != null
        return (
          <div key={row.key} className={`macro-bar-row ${over ? 'over' : ''}`}>
            <div className="macro-bar-head">
              <span>
                {row.label}
                {own ? <em> eigenes Ziel</em> : null}
              </span>
              <strong>
                {formatMacro(value)} / {formatMacro(target)} g
              </strong>
            </div>
            <div className="goal-bar" aria-hidden="true">
              <span className="goal-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
