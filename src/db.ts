import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Dish, Food, LogEntry } from './types'

interface KTrackDB extends DBSchema {
  foods: {
    key: string
    value: Food
    indexes: { 'by-barcode': string; 'by-updated': number }
  }
  dishes: {
    key: string
    value: Dish
    indexes: { 'by-updated': number }
  }
  entries: {
    key: string
    value: LogEntry
    indexes: { 'by-date': string }
  }
}

let dbPromise: Promise<IDBPDatabase<KTrackDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<KTrackDB>('ktrack', 1, {
      upgrade(db) {
        const foods = db.createObjectStore('foods', { keyPath: 'id' })
        foods.createIndex('by-barcode', 'barcode', { unique: false })
        foods.createIndex('by-updated', 'updatedAt')
        const dishes = db.createObjectStore('dishes', { keyPath: 'id' })
        dishes.createIndex('by-updated', 'updatedAt')
        const entries = db.createObjectStore('entries', { keyPath: 'id' })
        entries.createIndex('by-date', 'date')
      },
    })
  }
  return dbPromise
}

export async function getFoods(): Promise<Food[]> {
  const db = await getDb()
  const foods = await db.getAllFromIndex('foods', 'by-updated')
  return foods.reverse()
}

export async function getFood(id: string): Promise<Food | undefined> {
  const db = await getDb()
  return db.get('foods', id)
}

export async function getFoodByBarcode(barcode: string): Promise<Food | undefined> {
  const db = await getDb()
  return db.getFromIndex('foods', 'by-barcode', barcode)
}

export async function putFood(food: Food): Promise<void> {
  const db = await getDb()
  await db.put('foods', food)
}

export async function getDishes(): Promise<Dish[]> {
  const db = await getDb()
  const dishes = await db.getAllFromIndex('dishes', 'by-updated')
  return dishes.reverse()
}

export async function getDish(id: string): Promise<Dish | undefined> {
  const db = await getDb()
  return db.get('dishes', id)
}

export async function putDish(dish: Dish): Promise<void> {
  const db = await getDb()
  await db.put('dishes', dish)
}

export async function deleteDish(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('dishes', id)
}

export async function getEntries(): Promise<LogEntry[]> {
  const db = await getDb()
  const entries = await db.getAll('entries')
  entries.sort((a, b) => b.createdAt - a.createdAt)
  return entries
}

export async function getEntry(id: string): Promise<LogEntry | undefined> {
  const db = await getDb()
  return db.get('entries', id)
}

export async function putEntry(entry: LogEntry): Promise<void> {
  const db = await getDb()
  await db.put('entries', entry)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('entries', id)
}

export function newId(): string {
  return crypto.randomUUID()
}
