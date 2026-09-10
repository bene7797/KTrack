import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { foodFromParts, useData } from '../data'
import { newId } from '../db'
import { dishPer100g, dishTotals, formatKcal } from '../nutrition'
import { lookupBarcode } from '../off'
import type { Dish, Food } from '../types'
import { AmountForm } from './AmountForm'
import { Scanner } from './Scanner'

type View =
  | { t: 'menu' }
  | { t: 'scan' }
  | { t: 'loading' }
  | { t: 'amount'; food: Food }
  | { t: 'manual'; barcode?: string; name?: string }
  | { t: 'dishes' }
  | { t: 'dish-amount'; dish: Dish }
  | { t: 'error'; barcode: string; message: string }

type Props = {
  date: string
  onClose: () => void
}

export function AddSheet({ date, onClose }: Props) {
  const { foods, dishes, logItem, saveFood } = useData()
  const navigate = useNavigate()
  const [view, setView] = useState<View>({ t: 'menu' })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const finishFood = async (food: Food, grams: number, name: string) => {
    await saveFood({ ...food, name })
    await logItem({
      date,
      name,
      grams,
      per100g: food.per100g,
      source: { type: 'food', id: food.id },
    })
    onClose()
  }

  const onDetect = useCallback(async (barcode: string) => {
    setView({ t: 'loading' })
    const found = foods.find((f) => f.barcode === barcode)
    if (found) {
      setView({ t: 'amount', food: found })
      return
    }
    const result = await lookupBarcode(barcode)
    if (result.ok) {
      const empty =
        result.per100g.kcal === 0 && result.per100g.protein === 0 && result.per100g.carbs === 0 && result.per100g.fat === 0
      if (empty) {
        setView({ t: 'manual', barcode: result.barcode, name: result.name })
        return
      }
      setView({
        t: 'amount',
        food: foodFromParts({
          name: result.name,
          barcode: result.barcode,
          per100g: result.per100g,
        }),
      })
      return
    }
    setView({
      t: 'error',
      barcode,
      message: result.reason === 'network' ? 'Keine Verbindung zu Open Food Facts.' : 'Produkt nicht gefunden.',
    })
  }, [foods])

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      {view.t === 'scan' ? <Scanner onDetect={(code) => void onDetect(code)} onClose={() => setView({ t: 'menu' })} /> : null}
      {view.t !== 'scan' ? (
        <div
          className={`sheet ${view.t === 'menu' || view.t === 'dishes' ? 'sheet-half' : 'sheet-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {view.t === 'menu' ? (
            <>
              <div className="sheet-handle" />
              <h2 className="sheet-title">Hinzufügen</h2>
              <div className="action-grid">
                <button type="button" className="action-card" onClick={() => setView({ t: 'scan' })}>
                  <span>Scannen</span>
                  <small>Barcode</small>
                </button>
                <button type="button" className="action-card" onClick={() => setView({ t: 'manual' })}>
                  <span>Manuell</span>
                  <small>Name &amp; kcal</small>
                </button>
                <button type="button" className="action-card" onClick={() => setView({ t: 'dishes' })}>
                  <span>Gericht</span>
                  <small>Gespeichert</small>
                </button>
                <button
                  type="button"
                  className="action-card"
                  onClick={() => {
                    onClose()
                    void navigate('/neu/gericht')
                  }}
                >
                  <span>Neues Gericht</span>
                  <small>Aus Zutaten</small>
                </button>
              </div>
              {foods.length > 0 ? (
                <>
                  <h3 className="section-label">Zuletzt</h3>
                  <ul className="plain-list">
                    {foods.slice(0, 8).map((food) => (
                      <li key={food.id}>
                        <button type="button" className="list-btn" onClick={() => setView({ t: 'amount', food })}>
                          <span>{food.name}</span>
                          <small>{formatKcal(food.per100g.kcal)} kcal / 100 g</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : null}

          {view.t === 'loading' ? <p className="hint">Suche Produkt…</p> : null}

          {view.t === 'error' ? (
            <div className="stack">
              <button type="button" className="text-btn" onClick={() => setView({ t: 'menu' })}>
                Zurück
              </button>
              <p className="hint warn">{view.message}</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => setView({ t: 'manual', barcode: view.barcode })}
              >
                Manuell eintragen
              </button>
              <button type="button" className="btn" onClick={() => setView({ t: 'scan' })}>
                Erneut scannen
              </button>
            </div>
          ) : null}

          {view.t === 'amount' ? (
            <div className="stack">
              <button type="button" className="text-btn" onClick={() => setView({ t: 'menu' })}>
                Zurück
              </button>
              <AmountForm
                initialName={view.food.name}
                per100g={view.food.per100g}
                submitLabel="Eintragen"
                onSubmit={({ name, grams }) => void finishFood(view.food, grams, name)}
              />
            </div>
          ) : null}

          {view.t === 'manual' ? (
            <div className="stack">
              <button type="button" className="text-btn" onClick={() => setView({ t: 'menu' })}>
                Zurück
              </button>
              <AmountForm
                title="Manuell"
                initialName={view.name ?? ''}
                allowManualMacros
                submitLabel="Eintragen"
                onSubmit={async ({ name, grams, per100g }) => {
                  const food = foodFromParts({
                    name,
                    barcode: view.barcode,
                    per100g,
                  })
                  await finishFood(food, grams, name)
                }}
              />
            </div>
          ) : null}

          {view.t === 'dishes' ? (
            <div className="stack">
              <button type="button" className="text-btn" onClick={() => setView({ t: 'menu' })}>
                Zurück
              </button>
              <h2 className="sheet-title">Gericht wählen</h2>
              {dishes.length === 0 ? (
                <p className="hint">Noch keine Gerichte gespeichert.</p>
              ) : (
                <ul className="plain-list">
                  {dishes.map((dish) => {
                    const { grams, nutrients } = dishTotals(dish)
                    return (
                      <li key={dish.id}>
                        <button type="button" className="list-btn" onClick={() => setView({ t: 'dish-amount', dish })}>
                          <span>{dish.name}</span>
                          <small>
                            {formatKcal(nutrients.kcal)} kcal · {Math.round(grams)} g
                          </small>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ) : null}

          {view.t === 'dish-amount' ? (
            <div className="stack">
              <button type="button" className="text-btn" onClick={() => setView({ t: 'dishes' })}>
                Zurück
              </button>
              <AmountForm
                initialName={view.dish.name}
                initialGrams={dishTotals(view.dish).grams || 100}
                per100g={dishPer100g(view.dish)}
                submitLabel="Eintragen"
                onSubmit={async ({ name, grams, per100g }) => {
                  await logItem({
                    date,
                    name,
                    grams,
                    per100g,
                    source: { type: 'dish', id: view.dish.id },
                  })
                  onClose()
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function IngredientPicker({
  onPick,
  onClose,
}: {
  onPick: (food: Food, grams: number, name: string) => void
  onClose: () => void
}) {
  const { foods, saveFood } = useData()
  const [view, setView] = useState<View>({ t: 'menu' })

  const onDetect = useCallback(async (barcode: string) => {
    setView({ t: 'loading' })
    const found = foods.find((f) => f.barcode === barcode)
    if (found) {
      setView({ t: 'amount', food: found })
      return
    }
    const result = await lookupBarcode(barcode)
    if (result.ok) {
      setView({
        t: 'amount',
        food: foodFromParts({ name: result.name, barcode: result.barcode, per100g: result.per100g }),
      })
      return
    }
    setView({
      t: 'error',
      barcode,
      message: result.reason === 'network' ? 'Keine Verbindung.' : 'Produkt nicht gefunden.',
    })
  }, [foods])

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      {view.t === 'scan' ? <Scanner onDetect={(code) => void onDetect(code)} onClose={() => setView({ t: 'menu' })} /> : null}
      {view.t !== 'scan' ? (
        <div className="sheet sheet-full" onClick={(e) => e.stopPropagation()}>
          {view.t === 'menu' ? (
            <>
              <button type="button" className="text-btn" onClick={onClose}>
                Abbrechen
              </button>
              <h2 className="sheet-title">Zutat</h2>
              <div className="action-grid">
                <button type="button" className="action-card" onClick={() => setView({ t: 'scan' })}>
                  <span>Scannen</span>
                </button>
                <button type="button" className="action-card" onClick={() => setView({ t: 'manual' })}>
                  <span>Manuell</span>
                </button>
              </div>
              {foods.length > 0 ? (
                <ul className="plain-list">
                  {foods.slice(0, 12).map((food) => (
                    <li key={food.id}>
                      <button type="button" className="list-btn" onClick={() => setView({ t: 'amount', food })}>
                        <span>{food.name}</span>
                        <small>{formatKcal(food.per100g.kcal)} kcal / 100 g</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
          {view.t === 'loading' ? <p className="hint">Suche Produkt…</p> : null}
          {view.t === 'error' ? (
            <div className="stack">
              <p className="hint warn">{view.message}</p>
              <button type="button" className="btn primary" onClick={() => setView({ t: 'manual', barcode: view.barcode })}>
                Manuell
              </button>
            </div>
          ) : null}
          {view.t === 'amount' ? (
            <AmountForm
              initialName={view.food.name}
              per100g={view.food.per100g}
              submitLabel="Hinzufügen"
              onSubmit={async ({ name, grams }) => {
                await saveFood({ ...view.food, name })
                onPick(view.food, grams, name)
              }}
            />
          ) : null}
          {view.t === 'manual' ? (
            <AmountForm
              initialName=""
              allowManualMacros
              submitLabel="Hinzufügen"
              onSubmit={async ({ name, grams, per100g }) => {
                const food = foodFromParts({ id: newId(), name, barcode: view.barcode, per100g })
                await saveFood(food)
                onPick(food, grams, name)
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
