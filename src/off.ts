import { emptyNutrients } from './nutrition'
import type { Nutrients, Vitamin } from './types'

const USER_AGENT = 'KTrack/1.0 (https://github.com/bene7797/KTrack)'

type OffNutriments = Record<string, number | string | undefined>

type OffProduct = {
  code?: string
  product_name?: string
  product_name_de?: string
  generic_name?: string
  brands?: string | string[]
  nutriments?: OffNutriments
}

type OffResponse = {
  status: number
  product?: OffProduct
}

const VITAMIN_MAP: { keys: string[]; label: string; fallbackUnit: string }[] = [
  { keys: ['vitamin-a', 'vitamin_a'], label: 'Vitamin A', fallbackUnit: 'µg' },
  { keys: ['vitamin-d', 'vitamin-d3', 'vitamin_d'], label: 'Vitamin D', fallbackUnit: 'µg' },
  { keys: ['vitamin-e', 'vitamin_e'], label: 'Vitamin E', fallbackUnit: 'mg' },
  { keys: ['vitamin-k', 'vitamin_k'], label: 'Vitamin K', fallbackUnit: 'µg' },
  { keys: ['vitamin-c', 'vitamin_c'], label: 'Vitamin C', fallbackUnit: 'mg' },
  { keys: ['vitamin-b1', 'thiamin'], label: 'Vitamin B1', fallbackUnit: 'mg' },
  { keys: ['vitamin-b2', 'riboflavin'], label: 'Vitamin B2', fallbackUnit: 'mg' },
  { keys: ['vitamin-pp', 'niacin', 'vitamin-b3'], label: 'Niacin', fallbackUnit: 'mg' },
  { keys: ['vitamin-b6', 'vitamin_b6'], label: 'Vitamin B6', fallbackUnit: 'mg' },
  { keys: ['vitamin-b9', 'folates', 'folic-acid'], label: 'Folsäure', fallbackUnit: 'µg' },
  { keys: ['vitamin-b12', 'vitamin_b12'], label: 'Vitamin B12', fallbackUnit: 'µg' },
  { keys: ['calcium'], label: 'Calcium', fallbackUnit: 'mg' },
  { keys: ['iron'], label: 'Eisen', fallbackUnit: 'mg' },
  { keys: ['magnesium'], label: 'Magnesium', fallbackUnit: 'mg' },
  { keys: ['potassium'], label: 'Kalium', fallbackUnit: 'mg' },
  { keys: ['zinc'], label: 'Zink', fallbackUnit: 'mg' },
  { keys: ['phosphorus'], label: 'Phosphor', fallbackUnit: 'mg' },
  { keys: ['iodine'], label: 'Jod', fallbackUnit: 'µg' },
]

function num(n: OffNutriments | undefined, ...keys: string[]): number {
  if (!n) return 0
  for (const key of keys) {
    const v = n[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '') {
      const parsed = Number.parseFloat(v.replace(',', '.'))
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

function mapNutrients(n: OffNutriments | undefined): Nutrients {
  const kcal =
    num(n, 'energy-kcal_100g', 'energy-kcal', 'energy_kcal_100g') ||
    (num(n, 'energy-kj_100g', 'energy-kj', 'energy_100g') > 0
      ? num(n, 'energy-kj_100g', 'energy-kj', 'energy_100g') / 4.184
      : 0)

  let salt = num(n, 'salt_100g', 'salt')
  if (salt === 0) {
    const sodium = num(n, 'sodium_100g', 'sodium')
    if (sodium > 0) salt = sodium * 2.5
  }

  const vitamins: Vitamin[] = []
  for (const spec of VITAMIN_MAP) {
    let value = 0
    let unit = spec.fallbackUnit
    for (const key of spec.keys) {
      value = num(n, `${key}_100g`, key)
      if (value > 0) {
        const unitVal = n?.[`${key}_unit`]
        if (typeof unitVal === 'string' && unitVal.trim()) unit = unitVal.trim()
        break
      }
    }
    if (value > 0) vitamins.push({ key: spec.label, label: spec.label, value, unit })
  }

  return {
    kcal,
    protein: num(n, 'proteins_100g', 'proteins'),
    carbs: num(n, 'carbohydrates_100g', 'carbohydrates'),
    fat: num(n, 'fat_100g', 'fat'),
    fiber: num(n, 'fiber_100g', 'fiber'),
    sugar: num(n, 'sugars_100g', 'sugars'),
    salt,
    vitamins,
  }
}

function brandName(p: OffProduct): string {
  if (Array.isArray(p.brands)) return (p.brands[0] || '').trim()
  return (p.brands || '').split(',')[0]?.trim() || ''
}

function productName(p: OffProduct): string {
  const name = (p.product_name_de || p.product_name || p.generic_name || '').trim()
  const brand = brandName(p)
  if (name && brand && !name.toLowerCase().includes(brand.toLowerCase())) return `${brand} ${name}`
  return name || brand || 'Unbekanntes Produkt'
}

export type OffHit = {
  barcode?: string
  name: string
  per100g: Nutrients
}

function fromProduct(p: OffProduct): OffHit | null {
  const name = productName(p)
  const per100g = mapNutrients(p.nutriments)
  const empty =
    per100g.kcal === 0 && per100g.protein === 0 && per100g.carbs === 0 && per100g.fat === 0
  if ((!name || name === 'Unbekanntes Produkt') && empty) return null
  return {
    barcode: p.code,
    name: name || (p.code ? `Produkt ${p.code}` : 'Unbekanntes Produkt'),
    per100g,
  }
}

export type OffLookup =
  | { ok: true; barcode: string; name: string; per100g: Nutrients }
  | { ok: false; barcode: string; reason: 'not-found' | 'network' }

export async function searchProducts(query: string, signal?: AbortSignal): Promise<OffHit[]> {
  const q = query.trim()
  if (q.length < 2) return []
  try {
    return await searchLicous(q, signal)
  } catch {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return searchCgi(q, signal)
  }
}

function collectHits(products: OffProduct[]): OffHit[] {
  const seen = new Set<string>()
  const hits: OffHit[] = []
  for (const product of products) {
    const hit = fromProduct(product)
    if (!hit) continue
    const key = (hit.barcode || hit.name).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    hits.push(hit)
  }
  return hits
}

async function searchLicous(q: string, signal?: AbortSignal): Promise<OffHit[]> {
  const url = new URL('https://search.openfoodfacts.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('page_size', '12')
  url.searchParams.set('langs', 'de')
  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal })
  if (!res.ok) throw new Error('search failed')
  const data = (await res.json()) as { hits?: OffProduct[] }
  return collectHits(data.hits ?? [])
}

async function searchCgi(q: string, signal?: AbortSignal): Promise<OffHit[]> {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl')
  url.searchParams.set('search_terms', q)
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')
  url.searchParams.set('json', '1')
  url.searchParams.set('page_size', '12')
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal,
  })
  if (!res.ok) throw new Error('search failed')
  const data = (await res.json()) as { products?: OffProduct[] }
  return collectHits(data.products ?? [])
}

export async function lookupBarcode(barcode: string): Promise<OffLookup> {
  const code = barcode.replace(/\s/g, '')
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    })
    if (!res.ok) return { ok: false, barcode: code, reason: 'network' }
    const data = (await res.json()) as OffResponse
    if (data.status !== 1 || !data.product) return { ok: false, barcode: code, reason: 'not-found' }
    const per100g = mapNutrients(data.product.nutriments)
    const name = productName(data.product)
    if (!name && per100g.kcal === 0 && per100g.protein === 0) {
      return { ok: false, barcode: code, reason: 'not-found' }
    }
    return { ok: true, barcode: code, name: name || `Produkt ${code}`, per100g }
  } catch {
    return { ok: false, barcode: code, reason: 'network' }
  }
}

export function blankProduct(barcode: string): { barcode: string; name: string; per100g: Nutrients } {
  return { barcode, name: '', per100g: emptyNutrients() }
}
