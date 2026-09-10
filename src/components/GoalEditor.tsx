import { useState } from 'react'
import { formatKcal } from '../nutrition'

type Props = {
  goal: number | null
  onSave: (n: number | null) => void
}

export function GoalEditor({ goal, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(goal ? String(goal) : '2200')

  if (!open) {
    return (
      <button
        type="button"
        className="text-btn"
        onClick={() => {
          setValue(goal ? String(goal) : '2200')
          setOpen(true)
        }}
      >
        {goal ? `Ziel ${formatKcal(goal)}` : 'Ziel setzen'}
      </button>
    )
  }

  return (
    <form
      className="goal-edit"
      onSubmit={(e) => {
        e.preventDefault()
        const n = Number.parseInt(value.replace(/\D/g, ''), 10)
        onSave(Number.isFinite(n) && n > 0 ? n : null)
        setOpen(false)
      }}
    >
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Tägliches kcal-Ziel"
      />
      <button type="submit" className="btn small primary">
        OK
      </button>
      {goal ? (
        <button
          type="button"
          className="text-btn"
          onClick={() => {
            onSave(null)
            setOpen(false)
          }}
        >
          Weg
        </button>
      ) : null}
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
