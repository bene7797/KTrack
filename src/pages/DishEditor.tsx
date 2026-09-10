import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IngredientPicker } from '../components/AddSheet'
import { BackLink } from '../components/Nav'
import { NutrientPanel } from '../components/NutrientPanel'
import { useData } from '../data'
import { newId } from '../db'
import { dishTotals, formatGrams } from '../nutrition'
import type { Dish, DishIngredient } from '../types'

export function DishEditor() {
  const { id } = useParams()
  const { ready, dishes, saveDish } = useData()
  const existing = dishes.find((d) => d.id === id)
  const navigate = useNavigate()
  const [name, setName] = useState(existing?.name ?? '')
  const [ingredients, setIngredients] = useState<DishIngredient[]>(existing?.ingredients ?? [])
  const [picking, setPicking] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current || !ready) return
    if (!id) {
      hydrated.current = true
      return
    }
    if (existing) {
      setName(existing.name)
      setIngredients(existing.ingredients)
      hydrated.current = true
    }
  }, [id, existing, ready])

  const preview: Dish = useMemo(
    () => ({
      id: existing?.id ?? 'preview',
      name,
      ingredients,
      updatedAt: 0,
    }),
    [existing?.id, ingredients, name],
  )
  const { grams, nutrients } = dishTotals(preview)

  if (id && ready && !existing) {
    return (
      <main className="page">
        <BackLink to="/gerichte">Gerichte</BackLink>
        <p className="empty">Gericht nicht gefunden.</p>
      </main>
    )
  }

  return (
    <main className="page">
      <BackLink to={existing ? `/gericht/${existing.id}` : '/gerichte'}>Zurück</BackLink>
      <h1 className="page-title">{existing ? 'Gericht bearbeiten' : 'Neues Gericht'}</h1>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Nudeln mit Sauce" />
      </label>
      <h3 className="section-label">Zutaten</h3>
      {ingredients.length === 0 ? (
        <p className="hint">Zutaten scannen oder manuell hinzufügen.</p>
      ) : (
        <ul className="plain-list">
          {ingredients.map((ing, i) => (
            <li key={`${ing.foodId}-${i}`} className="static-row">
              <span>
                {ing.name}
                <small className="inline-meta">{formatGrams(ing.grams)}</small>
              </span>
              <button
                type="button"
                className="text-btn"
                onClick={() => setIngredients((list) => list.filter((_, idx) => idx !== i))}
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn" onClick={() => setPicking(true)}>
        Zutat hinzufügen
      </button>
      {grams > 0 ? <NutrientPanel nutrients={nutrients} gramsLabel={`Summe · ${formatGrams(grams)}`} /> : null}
      <button
        type="button"
        className="btn primary"
        disabled={!name.trim() || ingredients.length === 0}
        onClick={async () => {
          const dish: Dish = {
            id: existing?.id ?? newId(),
            name: name.trim(),
            ingredients,
            updatedAt: Date.now(),
          }
          await saveDish(dish)
          void navigate(`/gericht/${dish.id}`)
        }}
      >
        Speichern
      </button>
      {picking ? (
        <IngredientPicker
          onClose={() => setPicking(false)}
          onPick={(food, g, foodName) => {
            setIngredients((list) => [
              ...list,
              { foodId: food.id, name: foodName, grams: g, per100g: food.per100g },
            ])
            setPicking(false)
          }}
        />
      ) : null}
    </main>
  )
}
