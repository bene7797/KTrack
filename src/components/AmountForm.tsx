import { useMemo, useState } from 'react'
import { forGrams, formatGrams, fromManual } from '../nutrition'
import type { Nutrients } from '../types'
import { NutrientPanel } from './NutrientPanel'

type ManualValues = {
  kcal: string
  protein: string
  carbs: string
  fat: string
}

type Props = {
  title?: string
  initialName: string
  initialGrams?: number
  per100g?: Nutrients
  allowManualMacros?: boolean
  submitLabel: string
  onSubmit: (result: { name: string; grams: number; per100g: Nutrients }) => void
}

function parseNum(v: string): number {
  const n = Number.parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function AmountForm({
  title,
  initialName,
  initialGrams = 100,
  per100g,
  allowManualMacros = false,
  submitLabel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName)
  const [grams, setGrams] = useState(String(initialGrams))
  const [manual, setManual] = useState<ManualValues>({
    kcal: per100g ? String(Math.round(forGrams(per100g, initialGrams).kcal)) : '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const gramsNum = parseNum(grams) || 0
  const preview = useMemo(() => {
    if (per100g && !allowManualMacros) return forGrams(per100g, gramsNum || 0)
    return forGrams(
      fromManual({
        kcal: parseNum(manual.kcal),
        protein: parseNum(manual.protein),
        carbs: parseNum(manual.carbs),
        fat: parseNum(manual.fat),
        fiber: 0,
        sugar: 0,
        salt: 0,
        grams: gramsNum || 100,
      }),
      gramsNum || 100,
    )
  }, [allowManualMacros, gramsNum, manual, per100g])

  const canSave = name.trim().length > 0 && gramsNum > 0

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim() || gramsNum <= 0) return
        const nutrients = per100g && !allowManualMacros
          ? per100g
          : fromManual({
              kcal: parseNum(manual.kcal),
              protein: parseNum(manual.protein),
              carbs: parseNum(manual.carbs),
              fat: parseNum(manual.fat),
              fiber: 0,
              sugar: 0,
              salt: 0,
              grams: gramsNum,
            })
        onSubmit({ name: name.trim(), grams: gramsNum, per100g: nutrients })
      }}
    >
      {title ? <h2 className="sheet-title">{title}</h2> : null}
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" />
      </label>
      <label>
        Menge
        <div className="input-suffix">
          <input
            inputMode="decimal"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            required
          />
          <span>g</span>
        </div>
      </label>
      {allowManualMacros || !per100g ? (
        <div className="manual-grid">
          <label>
            kcal
            <input
              inputMode="decimal"
              value={manual.kcal}
              onChange={(e) => setManual((m) => ({ ...m, kcal: e.target.value }))}
              required
            />
          </label>
          <label>
            Protein
            <input
              inputMode="decimal"
              value={manual.protein}
              onChange={(e) => setManual((m) => ({ ...m, protein: e.target.value }))}
              placeholder="g"
            />
          </label>
          <label>
            Kohlenh.
            <input
              inputMode="decimal"
              value={manual.carbs}
              onChange={(e) => setManual((m) => ({ ...m, carbs: e.target.value }))}
              placeholder="g"
            />
          </label>
          <label>
            Fett
            <input
              inputMode="decimal"
              value={manual.fat}
              onChange={(e) => setManual((m) => ({ ...m, fat: e.target.value }))}
              placeholder="g"
            />
          </label>
        </div>
      ) : (
        <NutrientPanel nutrients={preview} gramsLabel={`für ${formatGrams(gramsNum || 0)}`} />
      )}
      <button type="submit" className="btn primary" disabled={!canSave}>
        {submitLabel}
      </button>
    </form>
  )
}
