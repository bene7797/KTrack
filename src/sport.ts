export type SportPreset = {
  name: string
  kcalPerHour: number
}

export const SPORT_PRESETS: SportPreset[] = [
  { name: 'Fahrrad', kcalPerHour: 480 },
  { name: 'Fahrrad zügig', kcalPerHour: 700 },
  { name: 'Laufen', kcalPerHour: 680 },
  { name: 'Gehen', kcalPerHour: 280 },
  { name: 'Krafttraining', kcalPerHour: 350 },
  { name: 'Schwimmen', kcalPerHour: 550 },
  { name: 'Wandern', kcalPerHour: 400 },
  { name: 'Yoga', kcalPerHour: 210 },
]

export function kcalFromMinutes(kcalPerHour: number, minutes: number): number {
  if (minutes <= 0) return 0
  return Math.round((kcalPerHour * minutes) / 60)
}
