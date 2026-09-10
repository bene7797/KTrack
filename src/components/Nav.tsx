import { Link, NavLink } from 'react-router-dom'
import { Icon } from './Icons'

export function Nav() {
  return (
    <nav className="tabbar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
        <Icon name="sun" />
        Heute
      </NavLink>
      <NavLink to="/verlauf" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
        <Icon name="chart" />
        Verlauf
      </NavLink>
      <NavLink to="/gerichte" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
        <Icon name="bowl" />
        Gerichte
      </NavLink>
    </nav>
  )
}

export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="text-btn back-link">
      {children}
    </Link>
  )
}
