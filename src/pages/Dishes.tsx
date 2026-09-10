import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../data'
import { dishTotals, formatKcal } from '../nutrition'

export function Dishes() {
  const { dishes } = useData()
  const navigate = useNavigate()

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="page-title">Gerichte</h1>
        <button type="button" className="btn small" onClick={() => void navigate('/neu/gericht')}>
          Neu
        </button>
      </header>
      {dishes.length === 0 ? (
        <p className="empty">Gerichte aus Zutaten bauen und wiederverwenden.</p>
      ) : (
        <ul className="plain-list">
          {dishes.map((dish) => {
            const { grams, nutrients } = dishTotals(dish)
            return (
              <li key={dish.id}>
                <Link to={`/gericht/${dish.id}`} className="list-btn">
                  <span>{dish.name}</span>
                  <small>
                    {formatKcal(nutrients.kcal)} kcal · {Math.round(grams)} g
                  </small>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
