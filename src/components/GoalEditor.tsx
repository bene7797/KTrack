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

export function GoalLine({ kcal, goal }: { kcal: number; goal: number | null }) {
  if (!goal) return null
  const remain = goal - kcal
  if (remain >= 0) {
    return (
      <p className="goal-line">
        noch <strong>{formatKcal(remain)}</strong> bis Ziel
      </p>
    )
  }
  return (
    <p className="goal-line over">
      <strong>{formatKcal(-remain)}</strong> über Ziel
    </p>
  )
}
