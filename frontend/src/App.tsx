import React from 'react'
import RoutesPage from './pages/Routes'
import ComparePage from './pages/Compare'
import BankingPage from './pages/Banking'
import PoolingPage from './pages/Pooling'
import Layout from './components/Layout'

export default function App(){
  const [tab,setTab] = React.useState<'routes'|'compare'|'banking'|'pooling'>('routes')
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6 flex gap-2 flex-wrap">
          <button onClick={()=>setTab('routes')} className={`px-4 py-2 rounded ${tab==='routes'? 'bg-sky-600 text-white shadow':'bg-white ring-1 ring-gray-200'}`}>Routes</button>
          <button onClick={()=>setTab('compare')} className={`px-4 py-2 rounded ${tab==='compare'? 'bg-sky-600 text-white shadow':'bg-white ring-1 ring-gray-200'}`}>Compare</button>
          <button onClick={()=>setTab('banking')} className={`px-4 py-2 rounded ${tab==='banking'? 'bg-sky-600 text-white shadow':'bg-white ring-1 ring-gray-200'}`}>Banking</button>
          <button onClick={()=>setTab('pooling')} className={`px-4 py-2 rounded ${tab==='pooling'? 'bg-sky-600 text-white shadow':'bg-white ring-1 ring-gray-200'}`}>Pooling</button>
        </nav>

        <main>
          {tab === 'routes' && <RoutesPage />}
          {tab === 'compare' && <ComparePage />}
          {tab === 'banking' && <BankingPage />}
          {tab === 'pooling' && <PoolingPage />}
        </main>
      </div>
    </Layout>
  )
}
