import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import AddSale from './pages/AddSale'
import Expenses from './pages/Expenses'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { SalesProvider } from './context/SalesContext'

function App() {
  return (
    <SalesProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/add-sale" element={<AddSale />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </SalesProvider>
  )
}

export default App