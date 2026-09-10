import { useCallback, useState } from 'react'

const KCAL_KEY = 'ktrack-kcal-goal'
const GOALS_KEY = 'ktrack-goals'

export type Goals = {
  kcal: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

export type MacroKey = 'protein' | 'carbs' | 'fat'

export type MacroTargets = {
  protein: number | null
  carbs: number | null
  fat: number | null
}

const EMPTY: Goals = { kcal: null, protein: null, carbs: null, fat: null }

/** Built-in split of the daily calorie budget. */
const SPLIT = { protein: 0.2, carbs: 0.5, fat: 0.3 }

function parsePositive(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

function readGoals(): Goals {
  const packed = localStorage.getItem(GOALS_KEY)
  if (packed) {
    try {
      const parsed = JSON.parse(packed) as Partial<Goals>
      return {
        kcal: parsePositive(parsed.kcal),
        protein: parsePositive(parsed.protein),
        carbs: parsePositive(parsed.carbs),
        fat: parsePositive(parsed.fat),
      }
    } catch {
      /* fall through to legacy key */
    }
  }
  return { ...EMPTY, kcal: parsePositive(localStorage.getItem(KCAL_KEY)) }
}

function writeGoals(goals: Goals) {
  const next: Goals = {
    kcal: parsePositive(goals.kcal),
    protein: parsePositive(goals.protein),
    carbs: parsePositive(goals.carbs),
    fat: parsePositive(goals.fat),
  }
  if (!next.kcal && !next.protein && !next.carbs && !next.fat) {
    localStorage.removeItem(GOALS_KEY)
    localStorage.removeItem(KCAL_KEY)
    return next
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(next))
  if (next.kcal) localStorage.setItem(KCAL_KEY, String(next.kcal))
  else localStorage.removeItem(KCAL_KEY)
  return next
}

export function useGoals() {
  const [goals, setGoalsState] = useState<Goals>(() => readGoals())

  const setGoals = useCallback((next: Goals) => {
    setGoalsState(writeGoals(next))
  }, [])

  return { goals, setGoals }
}

export function recommendedMacros(kcal: number): Required<MacroTargets> {
  return {
    protein: Math.round((kcal * SPLIT.protein) / 4),
    carbs: Math.round((kcal * SPLIT.carbs) / 4),
    fat: Math.round((kcal * SPLIT.fat) / 9),
  }
}

export function macroTargets(goals: Goals, burned = 0): MacroTargets {
  const budget = (goals.kcal ?? 0) + Math.max(0, burned)
  const rec = budget > 0 ? recommendedMacros(budget) : null
  return {
    protein: goals.protein ?? rec?.protein ?? null,
    carbs: goals.carbs ?? rec?.carbs ?? null,
    fat: goals.fat ?? rec?.fat ?? null,
  }
}

export function hasMacroTargets(targets: MacroTargets): boolean {
  return targets.protein != null || targets.carbs != null || targets.fat != null
}

export function addMacroTargets(a: MacroTargets, b: MacroTargets): MacroTargets {
  const sum = (x: number | null, y: number | null) =>
    x == null && y == null ? null : (x ?? 0) + (y ?? 0)
  return {
    protein: sum(a.protein, b.protein),
    carbs: sum(a.carbs, b.carbs),
    fat: sum(a.fat, b.fat),
  }
}
