import { useEffect, useMemo, useState } from 'react'
import { foodFromParts } from '../data'
import { searchGenerics } from '../generics'
import { formatKcal } from '../nutrition'
import { searchProducts, type OffHit } from '../off'
import type { Food } from '../types'

type Props = {
  foods: Food[]
  placeholder?: string
  onPick: (food: Food) => void
}

export function FoodSearch({ foods, placeholder = 'z. B. Banane, Haferflocken', onPick }: Props) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<OffHit[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const local = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    return foods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
  }, [foods, query])

  const builtins = useMemo(() => {
    const names = new Set(local.map((f) => f.name.toLowerCase()))
    return searchGenerics(query).filter((f) => !names.has(f.name.toLowerCase()))
  }, [local, query])

  const remote = useMemo(() => {
    const taken = new Set(
      [...local, ...builtins].map((f) => f.name.toLowerCase()),
    )
    return hits.filter((hit) => {
      if (hit.barcode && foods.some((f) => f.barcode === hit.barcode)) return false
      if (taken.has(hit.name.toLowerCase())) return false
      return true
    })
  }, [builtins, foods, hits, local])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setHits([])
      setStatus('idle')
      return
    }
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => {
      setStatus('loading')
      void searchProducts(q, ctrl.signal)
        .then((result) => {
          setHits(result)
          setStatus('idle')
        })
        .catch(() => {
          if (ctrl.signal.aborted) return
          setHits([])
          setStatus('error')
        })
    }, 350)
    return () => {
      window.clearTimeout(timer)
      ctrl.abort()
    }
  }, [query])

  const pickHit = (hit: OffHit) => {
    onPick(foodFromParts({ name: hit.name, barcode: hit.barcode, per100g: hit.per100g }))
  }

  const nothing =
    status !== 'loading' &&
    query.trim().length >= 2 &&
    remote.length === 0 &&
    local.length === 0 &&
    builtins.length === 0

  return (
    <div className="stack">
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <label>
          Suchen
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
      </form>
      {local.length > 0 ? (
        <ul className="plain-list">
          {local.map((food) => (
            <li key={food.id}>
              <button type="button" className="list-btn" onClick={() => onPick(food)}>
                <span>{food.name}</span>
                <small>{formatKcal(food.per100g.kcal)} kcal / 100 g · gespeichert</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {builtins.length > 0 ? (
        <ul className="plain-list">
          {builtins.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                className="list-btn"
                onClick={() => onPick(foodFromParts({ name: food.name, per100g: food.per100g }))}
              >
                <span>{food.name}</span>
                <small>{formatKcal(food.per100g.kcal)} kcal / 100 g</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {status === 'loading' ? <p className="hint">Suche in Open Food Facts…</p> : null}
      {status === 'error' && remote.length === 0 && builtins.length === 0 ? (
        <p className="hint">Online-Suche nicht erreichbar. Unten selbst eintragen.</p>
      ) : null}
      {remote.length > 0 ? (
        <ul className="plain-list">
          {remote.map((hit) => (
            <li key={hit.barcode || hit.name}>
              <button type="button" className="list-btn" onClick={() => pickHit(hit)}>
                <span>{hit.name}</span>
                <small>
                  {hit.per100g.kcal > 0
                    ? `${formatKcal(hit.per100g.kcal)} kcal / 100 g`
                    : 'ohne Nährwerte'}
                </small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {nothing ? <p className="hint">Nichts gefunden. Unten selbst eintragen.</p> : null}
    </div>
  )
}
