import { useNavigate, useParams } from 'react-router-dom'
import { BackLink } from '../components/Nav'
import { useData } from '../data'
import { isToday } from '../dates'
import { formatKcal } from '../nutrition'
import type { Activity } from '../types'

function ActivityForm({ activity }: { activity: Activity }) {
  const { updateActivity, removeActivity } = useData()
  const navigate = useNavigate()
  const backTo = isToday(activity.date) ? '/' : `/tag/${activity.date}`

  return (
    <main className="page">
      <BackLink to={backTo}>Zurück</BackLink>
      <h1 className="page-title">{activity.name}</h1>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const name = (form.elements.namedItem('name') as HTMLInputElement).value
          const minutes = Number.parseFloat((form.elements.namedItem('minutes') as HTMLInputElement).value.replace(',', '.')) || 0
          const kcal = Number.parseFloat((form.elements.namedItem('kcal') as HTMLInputElement).value.replace(',', '.')) || 0
          await updateActivity({
            ...activity,
            name: name.trim() || activity.name,
            minutes: Math.max(0, Math.round(minutes)),
            kcal: Math.max(0, Math.round(kcal)),
          })
          void navigate(backTo)
        }}
      >
        <label>
          Name
          <input name="name" defaultValue={activity.name} />
        </label>
        <label>
          Minuten
          <input name="minutes" inputMode="numeric" defaultValue={activity.minutes} />
        </label>
        <label>
          kcal
          <input name="kcal" inputMode="numeric" defaultValue={activity.kcal} />
        </label>
        <p className="hint">{formatKcal(activity.kcal)} kcal verbraucht</p>
        <button type="submit" className="btn primary">
          Speichern
        </button>
      </form>
      <button
        type="button"
        className="btn danger"
        onClick={async () => {
          if (!window.confirm('Sport löschen?')) return
          await removeActivity(activity.id)
          void navigate(backTo)
        }}
      >
        Löschen
      </button>
    </main>
  )
}

export function ActivityDetail() {
  const { id } = useParams()
  const { ready, activities } = useData()
  const activity = activities.find((a) => a.id === id)

  if (!ready) {
    return (
      <main className="page">
        <p className="hint">Lädt…</p>
      </main>
    )
  }

  if (!activity) {
    return (
      <main className="page">
        <BackLink to="/">Heute</BackLink>
        <p className="empty">Sport nicht gefunden.</p>
      </main>
    )
  }

  return <ActivityForm key={activity.id} activity={activity} />
}
