import React from 'react'
import { getComparison } from '../api'

export default function ComparePage(){
  const [data,setData] = React.useState<any|null>(null)
  const [loading,setLoading] = React.useState(false)

  React.useEffect(()=>{
    setLoading(true)
    getComparison().then(d=>setData(d)).catch(()=>setData(null)).finally(()=>setLoading(false))
  },[])

  if(loading) return <div className="p-6 bg-white rounded shadow">Loading...</div>
  if(!data) return <div className="p-6 bg-white rounded shadow">No comparison data</div>

  const baseline = data.baseline
  const comps = data.comparisons || []

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-3">Route Comparison</h2>
      <p className="text-sm text-slate-600 mb-4">Compare selected routes against the baseline and see compliance status.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Baseline</div>
          <div className="font-medium">{baseline?.route_id || '—'}</div>
          <div className="text-xs text-slate-500">Intensity: {baseline?.ghg_intensity ?? '—'}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Compared</div>
          <div className="font-medium">{comps.length} routes</div>
          <div className="text-xs text-slate-500">Compliant: {comps.filter((c:any)=>c.compliant).length}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-slate-500">Target</div>
          <div className="font-medium">89.34 gCO₂e/MJ</div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Route</th>
              <th className="text-right px-3 py-2">Intensity</th>
              <th className="text-right px-3 py-2">% diff</th>
              <th className="text-center px-3 py-2">Compliant</th>
            </tr>
          </thead>
          <tbody>
            {comps.map((c:any)=> (
              <tr key={c.routeId} className="border-t">
                <td className="px-3 py-2">{c.routeId}</td>
                <td className="px-3 py-2 text-right">{c.ghgIntensity}</td>
                <td className="px-3 py-2 text-right">{c.percentDiff.toFixed(2)}%</td>
                <td className="px-3 py-2 text-center">{c.compliant? <span className="text-green-600">✓</span> : <span className="text-rose-600">✕</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Simple bar visual</h3>
        <div className="flex items-end gap-3 h-44 overflow-x-auto py-4">
          {([baseline, ...comps].map((row:any, idx:number) => {
            const value = Number(row?.ghg_intensity || 0)
            const height = Math.min(100, Math.max(2, (value / 120) * 100))
            return (
              <div key={idx} className="flex flex-col items-center" style={{width:80}}>
                <div style={{height: `${height}%`}} className={`w-full rounded-t bg-sky-400`} title={`${row.route_id || 'baseline'}: ${value}`} />
                <div className="text-xs mt-2 text-center truncate w-full">{row.route_id || 'baseline'}</div>
              </div>
            )
          }))}
        </div>
      </div>
    </div>
  )
}
