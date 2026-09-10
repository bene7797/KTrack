import { HashRouter, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { DataProvider } from './data'
import { DishDetail } from './pages/DishDetail'
import { DishEditor } from './pages/DishEditor'
import { Dishes } from './pages/Dishes'
import { EntryDetail } from './pages/EntryDetail'
import { History } from './pages/History'
import { Today } from './pages/Today'

export default function App() {
  return (
    <HashRouter>
      <DataProvider>
        <div className="shell">
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/tag/:date" element={<Today />} />
            <Route path="/verlauf" element={<History />} />
            <Route path="/gerichte" element={<Dishes />} />
            <Route path="/eintrag/:id" element={<EntryDetail />} />
            <Route path="/gericht/:id" element={<DishDetail />} />
            <Route path="/gericht/:id/bearbeiten" element={<DishEditor />} />
            <Route path="/neu/gericht" element={<DishEditor />} />
          </Routes>
          <Nav />
        </div>
      </DataProvider>
    </HashRouter>
  )
}
