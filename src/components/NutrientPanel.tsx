import { formatGrams, formatKcal, formatMacro, formatVitamin, hasExtras } from '../nutrition'
import type { Nutrients } from '../types'

type Props = {
  nutrients: Nutrients
  gramsLabel?: string
}

export function NutrientPanel({ nutrients, gramsLabel }: Props) {
  const extras = hasExtras(nutrients)
  const vitamins = nutrients.vitamins.filter((v) => v.value > 0)

  return (
    <div className="nutrients">
      {gramsLabel ? <p className="nutrients-caption">{gramsLabel}</p> : null}
      <div className="macro-grid">
        <div>
          <strong>{formatKcal(nutrients.kcal)}</strong>
          <span>kcal</span>
        </div>
        <div>
          <strong>{formatMacro(nutrients.protein)}</strong>
          <span>Protein</span>
        </div>
        <div>
          <strong>{formatMacro(nutrients.carbs)}</strong>
          <span>Kohlenh.</span>
        </div>
        <div>
          <strong>{formatMacro(nutrients.fat)}</strong>
          <span>Fett</span>
        </div>
      </div>
      {extras ? (
        <dl className="nutrient-list">
          {nutrients.fiber > 0.05 ? (
            <>
              <dt>Ballaststoffe</dt>
              <dd>{formatMacro(nutrients.fiber)} g</dd>
            </>
          ) : null}
          {nutrients.sugar > 0.05 ? (
            <>
              <dt>Zucker</dt>
              <dd>{formatMacro(nutrients.sugar)} g</dd>
            </>
          ) : null}
          {nutrients.salt > 0.005 ? (
            <>
              <dt>Salz</dt>
              <dd>{formatMacro(nutrients.salt)} g</dd>
            </>
          ) : null}
        </dl>
      ) : null}
      {vitamins.length > 0 ? (
        <>
          <h3 className="section-label">Vitamine, Mineralstoffe &amp; mehr</h3>
          <dl className="nutrient-list">
            {vitamins.map((v) => (
              <div key={v.key} className="nutrient-row">
                <dt>{v.label}</dt>
                <dd>{formatVitamin(v)}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </div>
  )
}

export function EntryRow({
  name,
  grams,
  kcal,
  meta,
}: {
  name: string
  grams: number
  kcal: number
  meta?: string
}) {
  const sport = kcal < 0
  return (
    <div className="entry-row">
      <div>
        <p className="entry-name">{name}</p>
        <p className="entry-meta">{meta ?? formatGrams(grams)}</p>
      </div>
      <p className={`entry-kcal ${sport ? 'sport' : ''}`}>
        {sport ? `−${formatKcal(-kcal)}` : formatKcal(kcal)}
      </p>
    </div>
  )
}
