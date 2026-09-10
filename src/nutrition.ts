import type { Dish, Nutrients, Vitamin } from './types'

export function emptyNutrients(): Nutrients {
  return {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    salt: 0,
    vitamins: [],
  }
}

export function scaleNutrients(n: Nutrients, factor: number): Nutrients {
  return {
    kcal: n.kcal * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
    fiber: n.fiber * factor,
    sugar: n.sugar * factor,
    salt: n.salt * factor,
    vitamins: n.vitamins.map((v) => ({ ...v, value: v.value * factor })),
  }
}

export function forGrams(per100g: Nutrients, grams: number): Nutrients {
  return scaleNutrients(per100g, grams / 100)
}

function mergeVitamins(lists: Vitamin[][]): Vitamin[] {
  const map = new Map<string, Vitamin>()
  for (const list of lists) {
    for (const v of list) {
      const prev = map.get(v.key)
      if (prev) map.set(v.key, { ...prev, value: prev.value + v.value })
      else map.set(v.key, { ...v })
    }
  }
  return [...map.values()]
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    fiber: a.fiber + b.fiber,
    sugar: a.sugar + b.sugar,
    salt: a.salt + b.salt,
    vitamins: mergeVitamins([a.vitamins, b.vitamins]),
  }
}

export function dishTotals(dish: Dish): { grams: number; nutrients: Nutrients } {
  let grams = 0
  let nutrients = emptyNutrients()
  for (const ing of dish.ingredients) {
    grams += ing.grams
    nutrients = addNutrients(nutrients, forGrams(ing.per100g, ing.grams))
  }
  return { grams, nutrients }
}

export function dishPer100g(dish: Dish): Nutrients {
  const { grams, nutrients } = dishTotals(dish)
  if (grams <= 0) return emptyNutrients()
  return scaleNutrients(nutrients, 100 / grams)
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  return items.reduce(addNutrients, emptyNutrients())
}

export function hasExtras(n: Nutrients): boolean {
  return n.fiber > 0.05 || n.sugar > 0.05 || n.salt > 0.005
}

export function formatKcal(n: number): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n))
}

export function formatMacro(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: rounded % 1 === 0 ? 0 : 1,
  }).format(rounded)
}

export function formatGrams(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(rounded)} g`
}

export function formatVitamin(v: Vitamin): string {
  const abs = Math.abs(v.value)
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3
  const n = new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(v.value)
  return `${n} ${v.unit}`
}

export function fromManual(input: {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  salt: number
  grams: number
}): Nutrients {
  const grams = input.grams > 0 ? input.grams : 100
  const eaten: Nutrients = {
    kcal: input.kcal,
    protein: input.protein,
    carbs: input.carbs,
    fat: input.fat,
    fiber: input.fiber,
    sugar: input.sugar,
    salt: input.salt,
    vitamins: [],
  }
  return scaleNutrients(eaten, 100 / grams)
}
