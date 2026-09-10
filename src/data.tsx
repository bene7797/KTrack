import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as db from './db'
import { addNutrients, emptyNutrients, forGrams } from './nutrition'
import type { Activity, Dish, Food, LogEntry, LogSource, Nutrients } from './types'

type DataCtx = {
  ready: boolean
  foods: Food[]
  dishes: Dish[]
  entries: LogEntry[]
  activities: Activity[]
  refresh: () => Promise<void>
  saveFood: (food: Food) => Promise<void>
  saveDish: (dish: Dish) => Promise<void>
  removeDish: (id: string) => Promise<void>
  logItem: (input: {
    date: string
    name: string
    grams: number
    per100g: Nutrients
    source: LogSource
  }) => Promise<void>
  updateEntry: (entry: LogEntry) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  logActivity: (input: { date: string; name: string; kcal: number; minutes: number }) => Promise<void>
  updateActivity: (activity: Activity) => Promise<void>
  removeActivity: (id: string) => Promise<void>
}

const DataContext = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [foods, setFoods] = useState<Food[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  const refresh = useCallback(async () => {
    const [f, d, e, a] = await Promise.all([db.getFoods(), db.getDishes(), db.getEntries(), db.getActivities()])
    setFoods(f)
    setDishes(d)
    setEntries(e)
    setActivities(a)
    setReady(true)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveFood = useCallback(
    async (food: Food) => {
      await db.putFood({ ...food, updatedAt: Date.now() })
      await refresh()
    },
    [refresh],
  )

  const saveDish = useCallback(
    async (dish: Dish) => {
      await db.putDish({ ...dish, updatedAt: Date.now() })
      await refresh()
    },
    [refresh],
  )

  const removeDish = useCallback(
    async (id: string) => {
      await db.deleteDish(id)
      await refresh()
    },
    [refresh],
  )

  const logItem = useCallback(
    async (input: { date: string; name: string; grams: number; per100g: Nutrients; source: LogSource }) => {
      const entry: LogEntry = {
        id: db.newId(),
        date: input.date,
        name: input.name.trim(),
        grams: input.grams,
        source: input.source,
        per100g: input.per100g,
        createdAt: Date.now(),
      }
      await db.putEntry(entry)
      if (input.source.type === 'food') {
        const food = await db.getFood(input.source.id)
        if (food) await db.putFood({ ...food, updatedAt: Date.now() })
      }
      if (input.source.type === 'dish') {
        const dish = await db.getDish(input.source.id)
        if (dish) await db.putDish({ ...dish, updatedAt: Date.now() })
      }
      await refresh()
    },
    [refresh],
  )

  const updateEntry = useCallback(
    async (entry: LogEntry) => {
      await db.putEntry(entry)
      await refresh()
    },
    [refresh],
  )

  const removeEntry = useCallback(
    async (id: string) => {
      await db.deleteEntry(id)
      await refresh()
    },
    [refresh],
  )

  const logActivity = useCallback(
    async (input: { date: string; name: string; kcal: number; minutes: number }) => {
      const activity: Activity = {
        id: db.newId(),
        date: input.date,
        name: input.name.trim(),
        kcal: Math.max(0, Math.round(input.kcal)),
        minutes: Math.max(0, Math.round(input.minutes)),
        createdAt: Date.now(),
      }
      await db.putActivity(activity)
      await refresh()
    },
    [refresh],
  )

  const updateActivity = useCallback(
    async (activity: Activity) => {
      await db.putActivity(activity)
      await refresh()
    },
    [refresh],
  )

  const removeActivity = useCallback(
    async (id: string) => {
      await db.deleteActivity(id)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      ready,
      foods,
      dishes,
      entries,
      activities,
      refresh,
      saveFood,
      saveDish,
      removeDish,
      logItem,
      updateEntry,
      removeEntry,
      logActivity,
      updateActivity,
      removeActivity,
    }),
    [
      ready,
      foods,
      dishes,
      entries,
      activities,
      refresh,
      saveFood,
      saveDish,
      removeDish,
      logItem,
      updateEntry,
      removeEntry,
      logActivity,
      updateActivity,
      removeActivity,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData outside provider')
  return ctx
}

export function useDayTotals(date: string) {
  const { entries, activities } = useData()
  const dayEntries = entries.filter((e) => e.date === date)
  const dayActivities = activities.filter((a) => a.date === date)
  const nutrients = dayEntries.reduce(
    (acc, e) => addNutrients(acc, forGrams(e.per100g, e.grams)),
    emptyNutrients(),
  )
  const burned = dayActivities.reduce((sum, a) => sum + a.kcal, 0)
  return { dayEntries, dayActivities, nutrients, burned, ...nutrients }
}

export function foodFromParts(input: {
  id?: string
  name: string
  barcode?: string
  per100g: Nutrients
}): Food {
  return {
    id: input.id ?? db.newId(),
    name: input.name.trim(),
    barcode: input.barcode,
    per100g: input.per100g,
    updatedAt: Date.now(),
  }
}
