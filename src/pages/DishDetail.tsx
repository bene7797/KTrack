import { useNavigate, useParams } from 'react-router-dom'
import { AmountForm } from '../components/AmountForm'
import { BackLink } from '../components/Nav'
import { NutrientPanel } from '../components/NutrientPanel'
import { useData } from '../data'
import { todayId } from '../dates'
import { dishPer100g, dishTotals, formatGrams } from '../nutrition'
import type { DishIngredient } from '../types'

export function DishDetail() {
  const { id } = useParams()
  const { ready, dishes, logItem, removeDish } = useData()
  const navigate = useNavigate()
  const dish = dishes.find((d) => d.id === id)

  if (!ready) {
    return (
      <main className="page">
        <p className="hint">Lädt…</p>
      </main>
    )
  }

  if (!dish) {
    return (
      <main className="page">
        <BackLink to="/gerichte">Gerichte</BackLink>
        <p className="empty">Gericht nicht gefunden.</p>
      </main>
    )
  }

  const { grams, nutrients } = dishTotals(dish)
  const per100g = dishPer100g(dish)

  return (
    <main className="page">
      <BackLink to="/gerichte">Gerichte</BackLink>
      <header className="page-head">
        <h1 className="page-title">{dish.name}</h1>
        <button type="button" className="btn small" onClick={() => void navigate(`/gericht/${dish.id}/bearbeiten`)}>
          Bearbeiten
        </button>
      </header>
      <NutrientPanel nutrients={nutrients} gramsLabel={`ganzes Gericht · ${formatGrams(grams)}`} />
      {dish.ingredients.length > 0 ? (
        <>
          <h3 className="section-label">Zutaten</h3>
          <ul className="plain-list">
            {dish.ingredients.map((ing: DishIngredient, i) => (
              <li key={`${ing.foodId}-${i}`} className="static-row">
                <span>{ing.name}</span>
                <small>{formatGrams(ing.grams)}</small>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <AmountForm
        title="Heute essen"
        initialName={dish.name}
        initialGrams={grams || 100}
        per100g={per100g}
        submitLabel="Eintragen"
        onSubmit={async ({ name, grams: g, per100g: n }) => {
          await logItem({
            date: todayId(),
            name,
            grams: g,
            per100g: n,
            source: { type: 'dish', id: dish.id },
          })
          void navigate('/')
        }}
      />
      <button
        type="button"
        className="btn danger"
        onClick={async () => {
          if (!window.confirm('Gericht löschen?')) return
          await removeDish(dish.id)
          void navigate('/gerichte')
        }}
      >
        Löschen
      </button>
    </main>
  )
}
