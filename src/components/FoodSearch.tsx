import { useEffect, useMemo, useState } from 'react'
import { foodFromParts } from '../data'
import { searchGenerics } from '../generics'
import { formatKcal } from '../nutrition'
import { searchProducts, type OffHit } from '../off'
import type { Food } from '../types'

type Tag = {
  key: string
  name: string
  kcal: number
  pick: () => void
}

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
    const taken = new Set([...local, ...builtins].map((f) => f.name.toLowerCase()))
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
    }, 280)
    return () => {
      window.clearTimeout(timer)
      ctrl.abort()
    }
  }, [query])

  const tags: Tag[] = useMemo(() => {
    const list: Tag[] = []
    for (const food of local) {
      list.push({
        key: food.id,
        name: food.name,
        kcal: food.per100g.kcal,
        pick: () => onPick(food),
      })
    }
    for (const food of builtins) {
      list.push({
        key: food.id,
        name: food.name,
        kcal: food.per100g.kcal,
        pick: () => onPick(foodFromParts({ name: food.name, per100g: food.per100g })),
      })
    }
    for (const hit of remote) {
      list.push({
        key: hit.barcode || hit.name,
        name: hit.name,
        kcal: hit.per100g.kcal,
        pick: () =>
          onPick(foodFromParts({ name: hit.name, barcode: hit.barcode, per100g: hit.per100g })),
      })
    }
    return list.slice(0, 12)
  }, [builtins, local, onPick, remote])

  const nothing =
    status !== 'loading' &&
    query.trim().length >= 2 &&
    tags.length === 0
  const hint =
    status === 'error' && tags.length === 0
      ? 'Online-Suche nicht erreichbar.'
      : nothing
        ? 'Nichts gefunden.'
        : null

  return (
    <div className="stack search-block">
      <div className="search-tags-slot">
        <div className="search-tags" aria-label="Treffer">
          {tags.map((tag) => (
            <button type="button" key={tag.key} className="search-tag" onClick={tag.pick}>
              <span>{tag.name}</span>
              {tag.kcal > 0 ? <small>{formatKcal(tag.kcal)}</small> : null}
            </button>
          ))}
          {status === 'loading' ? <span className="search-tag search-tag-ghost">Suche…</span> : null}
        </div>
        {hint ? <p className="hint search-hint">{hint}</p> : null}
      </div>
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault()
          tags[0]?.pick()
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
    </div>
  )
}
