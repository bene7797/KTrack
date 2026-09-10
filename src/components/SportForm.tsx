import { useMemo, useState } from 'react'
import { formatKcal } from '../nutrition'
import { kcalFromMinutes, SPORT_PRESETS } from '../sport'
import { Icon, sportIcon } from './Icons'

type Props = {
  onSubmit: (result: { name: string; minutes: number; kcal: number }) => void
}

export function SportForm({ onSubmit }: Props) {
  const [name, setName] = useState('Fahrrad')
  const [minutes, setMinutes] = useState('45')
  const [kcal, setKcal] = useState(String(kcalFromMinutes(480, 45)))
  const [perHour, setPerHour] = useState(480)

  const minutesNum = Number.parseFloat(minutes.replace(',', '.')) || 0
  const preview = useMemo(() => kcalFromMinutes(perHour, minutesNum), [minutesNum, perHour])

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault()
        const kcalNum = Number.parseFloat(kcal.replace(',', '.'))
        const burned = Number.isFinite(kcalNum) && kcalNum > 0 ? Math.round(kcalNum) : preview
        if (!name.trim() || burned <= 0) return
        onSubmit({ name: name.trim(), minutes: minutesNum > 0 ? Math.round(minutesNum) : 0, kcal: burned })
      }}
    >
      <h2 className="sheet-title">Sport</h2>
      <div className="search-tags">
        {SPORT_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className={name === p.name ? 'search-tag on sport-tag' : 'search-tag sport-tag'}
              onClick={() => {
                setName(p.name)
                setPerHour(p.kcalPerHour)
                const next = kcalFromMinutes(p.kcalPerHour, minutesNum || 45)
                setKcal(String(next))
              }}
            >
              <Icon name={sportIcon(p.name)} />
              <span>{p.name}</span>
            </button>
        ))}
      </div>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" />
      </label>
      <label>
        Minuten
        <input
          inputMode="numeric"
          value={minutes}
          onChange={(e) => {
            setMinutes(e.target.value)
            const m = Number.parseFloat(e.target.value.replace(',', '.')) || 0
            setKcal(String(kcalFromMinutes(perHour, m)))
          }}
        />
      </label>
      <label>
        kcal verbraucht
        <input inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} required />
      </label>
      <p className="hint">ca. {formatKcal(preview)} kcal bei {perHour} kcal/h</p>
      <button type="submit" className="btn primary" disabled={!name.trim()}>
        Eintragen
      </button>
    </form>
  )
}
