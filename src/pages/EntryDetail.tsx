import { useNavigate, useParams } from 'react-router-dom'
import { AmountForm } from '../components/AmountForm'
import { BackLink } from '../components/Nav'
import { useData } from '../data'
import { isToday } from '../dates'

export function EntryDetail() {
  const { id } = useParams()
  const { ready, entries, updateEntry, removeEntry } = useData()
  const navigate = useNavigate()
  const entry = entries.find((e) => e.id === id)

  if (!ready) {
    return (
      <main className="page">
        <p className="hint">Lädt…</p>
      </main>
    )
  }

  if (!entry) {
    return (
      <main className="page">
        <BackLink to="/">Heute</BackLink>
        <p className="empty">Eintrag nicht gefunden.</p>
      </main>
    )
  }

  const backTo = isToday(entry.date) ? '/' : `/tag/${entry.date}`

  return (
    <main className="page">
      <BackLink to={backTo}>Zurück</BackLink>
      <h1 className="page-title">{entry.name}</h1>
      <AmountForm
        initialName={entry.name}
        initialGrams={entry.grams}
        per100g={entry.per100g}
        submitLabel="Speichern"
        onSubmit={async ({ name, grams }) => {
          await updateEntry({ ...entry, name, grams })
          void navigate(backTo)
        }}
      />
      <button
        type="button"
        className="btn danger"
        onClick={async () => {
          if (!window.confirm('Eintrag löschen?')) return
          await removeEntry(entry.id)
          void navigate(backTo)
        }}
      >
        Löschen
      </button>
    </main>
  )
}
