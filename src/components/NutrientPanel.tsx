import type { MacroTargets } from '../goal'
import { formatGrams, formatKcal, formatMacro, formatVitamin, hasExtras } from '../nutrition'
import type { Nutrients } from '../types'
import { Icon, type IconName } from './Icons'

type Props = {
  nutrients: Nutrients
  gramsLabel?: string
  targets?: MacroTargets
}

export function NutrientPanel({ nutrients, gramsLabel, targets }: Props) {
  const extras = hasExtras(nutrients)
  const vitamins = nutrients.vitamins.filter((v) => v.value > 0)

  return (
    <div className="nutrients">
      {gramsLabel ? <p className="nutrients-caption">{gramsLabel}</p> : null}
      <div className="macro-grid">
        <div className="tone-kcal">
          <strong>{formatKcal(nutrients.kcal)}</strong>
          <span>kcal</span>
        </div>
        <div className="tone-protein">
          <strong>{formatMacro(nutrients.protein)}</strong>
          <span>Protein</span>
          {targets?.protein ? <small>von {formatMacro(targets.protein)} g</small> : null}
        </div>
        <div className="tone-carbs">
          <strong>{formatMacro(nutrients.carbs)}</strong>
          <span>Kohlenh.</span>
          {targets?.carbs ? <small>von {formatMacro(targets.carbs)} g</small> : null}
        </div>
        <div className="tone-fat">
          <strong>{formatMacro(nutrients.fat)}</strong>
          <span>Fett</span>
          {targets?.fat ? <small>von {formatMacro(targets.fat)} g</small> : null}
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
  icon,
}: {
  name: string
  grams: number
  kcal: number
  meta?: string
  icon?: IconName
}) {
  const sport = kcal < 0
  return (
    <div className="entry-row">
      {icon ? (
        <span className={`entry-icon ${sport ? 'sport' : ''}`}>
          <Icon name={icon} />
        </span>
      ) : null}
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
