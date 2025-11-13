import React from 'react'
import { getRoutes, setBaseline } from '../api'

export default function RoutesPage(){
  const [routes,setRoutes] = React.useState<any[]>([])
  const [loading,setLoading] = React.useState(false)
  const [vesselFilter,setVesselFilter] = React.useState<string>('all')
  const [fuelFilter,setFuelFilter] = React.useState<string>('all')
  const [yearFilter,setYearFilter] = React.useState<string>('all')
  const [settingBaseline, setSettingBaseline] = React.useState<string | null>(null)

  async function load(){
    setLoading(true)
    try{
      const data = await getRoutes()
      setRoutes(data)
    }catch(err){
      setRoutes([])
    }finally{
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() }, [])

  const vesselTypes = Array.from(new Set(routes.map(r=>r.vessel_type))).filter(Boolean)
  const fuelTypes = Array.from(new Set(routes.map(r=>r.fuel_type))).filter(Boolean)
  const years = Array.from(new Set(routes.map(r=>String(r.year)))).filter(Boolean)

  const filtered = routes.filter(r => {
    if (vesselFilter !== 'all' && r.vessel_type !== vesselFilter) return false
    if (fuelFilter !== 'all' && r.fuel_type !== fuelFilter) return false
    if (yearFilter !== 'all' && String(r.year) !== yearFilter) return false
    return true
  })

  async function onSetBaseline(routeId: string){
    setSettingBaseline(routeId)
    try{
      await setBaseline(routeId)
      await load()
    }catch(err:any){
      // simple alert for now
      alert(err?.message || String(err))
    }finally{
      setSettingBaseline(null)
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-3">Routes</h2>
      <p className="text-sm text-slate-600 mb-4">Browse routes, filter by vessel/fuel/year and set a baseline for comparison.</p>

      <div className="flex gap-2 mb-4">
        <div>
          <label className="block text-sm">Vessel Type</label>
          <select value={vesselFilter} onChange={e=>setVesselFilter(e.target.value)} className="border px-2 py-1">
            <option value="all">All</option>
            {vesselTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Fuel Type</label>
          <select value={fuelFilter} onChange={e=>setFuelFilter(e.target.value)} className="border px-2 py-1">
            <option value="all">All</option>
            {fuelTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Year</label>
          <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="border px-2 py-1">
            <option value="all">All</option>
            {years.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="p-4">Loading...</div>}
      {!loading && (
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-2 py-1">routeId</th>
              <th className="px-2 py-1">vesselType</th>
              <th className="px-2 py-1">fuelType</th>
              <th className="px-2 py-1">year</th>
              <th className="px-2 py-1">ghgIntensity</th>
              <th className="px-2 py-1">fuelConsumption</th>
              <th className="px-2 py-1">distance</th>
              <th className="px-2 py-1">totalEmissions</th>
              <th className="px-2 py-1">actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r:any)=> (
                <tr key={r.route_id} className="border-t">
                  <td className="px-2 py-2">{r.route_id}</td>
                  <td className="px-2 py-2">{r.vessel_type}</td>
                  <td className="px-2 py-2">{r.fuel_type}</td>
                  <td className="px-2 py-2">{r.year}</td>
                  <td className="px-2 py-2 text-right">{r.ghg_intensity}</td>
                  <td className="px-2 py-2 text-right">{r.fuel_consumption}</td>
                  <td className="px-2 py-2 text-right">{r.distance_km}</td>
                  <td className="px-2 py-2 text-right">{r.total_emissions}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={()=>onSetBaseline(r.route_id)}
                      disabled={settingBaseline !== null || r.is_baseline}
                      className={`px-3 py-1 rounded ${r.is_baseline ? 'bg-gray-300 text-slate-700' : 'bg-sky-600 text-white'}`}
                    >
                      {r.is_baseline ? 'Baseline' : (settingBaseline === r.route_id ? 'Setting...' : 'Set Baseline')}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
          </table>
          </div>
        )}
    </div>
  )
}
