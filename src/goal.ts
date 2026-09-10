import { useCallback, useState } from 'react'

const KEY = 'ktrack-kcal-goal'

function readGoal(): number | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function useKcalGoal() {
  const [goal, setGoalState] = useState<number | null>(() => readGoal())

  const setGoal = useCallback((n: number | null) => {
    if (n == null || n <= 0) {
      localStorage.removeItem(KEY)
      setGoalState(null)
      return
    }
    const rounded = Math.round(n)
    localStorage.setItem(KEY, String(rounded))
    setGoalState(rounded)
  }, [])

  return { goal, setGoal }
}

export function goalDelta(kcal: number, goal: number | null): { remain: number; over: boolean } | null {
  if (!goal) return null
  const remain = goal - kcal
  return { remain, over: remain < 0 }
}
