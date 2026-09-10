import type { Food } from './types'
import { emptyNutrients } from './nutrition'

type Row = {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  salt?: number
}

const ROWS: Row[] = [
  { name: 'Banane', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
  { name: 'Apfel', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10 },
  { name: 'Birne', kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, sugar: 10 },
  { name: 'Orange', kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9 },
  { name: 'Erdbeeren', kcal: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9 },
  { name: 'Heidelbeeren', kcal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10 },
  { name: 'Trauben', kcal: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16 },
  { name: 'Avocado', kcal: 160, protein: 2, carbs: 9, fat: 15, fiber: 6.7, sugar: 0.7 },
  { name: 'Tomate', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  { name: 'Gurke', kcal: 12, protein: 0.6, carbs: 2.2, fat: 0.1, fiber: 0.5, sugar: 1.7 },
  { name: 'Karotte', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  { name: 'Brokkoli', kcal: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7 },
  { name: 'Kartoffel', kcal: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  { name: 'Süßkartoffel', kcal: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2 },
  { name: 'Zwiebel', kcal: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7, sugar: 4.2 },
  { name: 'Reis, gekocht', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { name: 'Nudeln, gekocht', kcal: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  { name: 'Haferflocken', kcal: 379, protein: 13, carbs: 69, fat: 7, fiber: 10 },
  { name: 'Vollkornbrot', kcal: 247, protein: 8.5, carbs: 43, fat: 3.3, fiber: 7.4 },
  { name: 'Weißbrot', kcal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  { name: 'Ei', kcal: 155, protein: 13, carbs: 1.1, fat: 11, salt: 0.31 },
  { name: 'Milch 1,5%', kcal: 47, protein: 3.4, carbs: 4.8, fat: 1.5, sugar: 4.8, salt: 0.13 },
  { name: 'Joghurt natur', kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3, sugar: 4.7, salt: 0.13 },
  { name: 'Quark mager', kcal: 67, protein: 12, carbs: 4, fat: 0.2, sugar: 4 },
  { name: 'Käse, Gouda', kcal: 356, protein: 25, carbs: 2.2, fat: 27, salt: 1.8 },
  { name: 'Hähnchenbrust', kcal: 165, protein: 31, carbs: 0, fat: 3.6, salt: 0.19 },
  { name: 'Rinderhack, gebraten', kcal: 254, protein: 26, carbs: 0, fat: 16, salt: 0.2 },
  { name: 'Lachs', kcal: 208, protein: 20, carbs: 0, fat: 13, salt: 0.15 },
  { name: 'Thunfisch, Dose', kcal: 116, protein: 26, carbs: 0, fat: 0.8, salt: 0.8 },
  { name: 'Tofu', kcal: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { name: 'Olivenöl', kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { name: 'Butter', kcal: 717, protein: 0.9, carbs: 0.1, fat: 81, salt: 0.02 },
  { name: 'Honig', kcal: 304, protein: 0.3, carbs: 82, fat: 0, sugar: 82 },
  { name: 'Zucker', kcal: 387, protein: 0, carbs: 100, fat: 0, sugar: 100 },
  { name: 'Erdnussbutter', kcal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, salt: 0.4 },
  { name: 'Mandeln', kcal: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, sugar: 4.4 },
  { name: 'Walnüsse', kcal: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
]

export function genericFoods(): Food[] {
  return ROWS.map((row, i) => ({
    id: `generic-${i}`,
    name: row.name,
    per100g: {
      ...emptyNutrients(),
      kcal: row.kcal,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber ?? 0,
      sugar: row.sugar ?? 0,
      salt: row.salt ?? 0,
    },
    updatedAt: 0,
  }))
}

export function searchGenerics(query: string): Food[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1) return []
  return genericFoods()
    .filter((f) => f.name.toLowerCase().includes(q))
    .slice(0, 8)
}
