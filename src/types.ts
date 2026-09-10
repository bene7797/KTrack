export type Vitamin = {
  key: string
  label: string
  value: number
  unit: string
}

export type Nutrients = {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  salt: number
  vitamins: Vitamin[]
}

export type Food = {
  id: string
  name: string
  barcode?: string
  per100g: Nutrients
  updatedAt: number
}

export type DishIngredient = {
  foodId: string
  name: string
  grams: number
  per100g: Nutrients
}

export type Dish = {
  id: string
  name: string
  ingredients: DishIngredient[]
  updatedAt: number
}

export type LogSource =
  | { type: 'food'; id: string }
  | { type: 'dish'; id: string }
  | { type: 'manual' }

export type LogEntry = {
  id: string
  date: string
  name: string
  grams: number
  source: LogSource
  per100g: Nutrients
  createdAt: number
}
