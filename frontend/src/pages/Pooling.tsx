import React from 'react'
import { createPool } from '../api'

export default function PoolingPage(){
  const [year,setYear] = React.useState<number>(2024)
  const [members,setMembers] = React.useState<{shipId:string, cbBefore:number}[]>([])
  const [shipId,setShipId] = React.useState('')
  const [cb,setCb] = React.useState<number>(0)
  const [result,setResult] = React.useState<any|null>(null)

  function addMember(){
    if(!shipId) return
    setMembers(prev=>[...prev, { shipId, cbBefore: cb }])
    setShipId('')
    setCb(0)
  }

  async function onCreate(){
    try{
      const res = await createPool(year, members)
      setResult(res)
    }catch(err:any){
      setResult({ error: err?.message || String(err) })
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl">
      <h2 className="text-2xl font-semibold mb-3">Pooling</h2>
      <p className="text-sm text-slate-600 mb-4">Create compliance pools for a year by adding member ships and their CB values.</p>

      <div className="mb-4">
        <label className="block text-sm text-slate-600">Year</label>
        <input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} className="border rounded px-3 py-2 w-36" />
      </div>

      <div className="flex gap-2 items-center mb-4">
        <input placeholder="shipId" value={shipId} onChange={e=>setShipId(e.target.value)} className="border rounded px-3 py-2" />
        <input type="number" value={cb} onChange={e=>setCb(Number(e.target.value))} className="border rounded px-3 py-2 w-36" />
        <button onClick={addMember} className="bg-slate-800 text-white px-4 py-2 rounded">Add</button>
      </div>

      <div className="mb-4">
        <ul className="list-disc pl-5 space-y-1">
          {members.map((m, idx)=> <li key={idx}>{m.shipId}: {m.cbBefore}</li>)}
        </ul>
      </div>

      <button onClick={onCreate} className="bg-green-600 text-white px-4 py-2 rounded">Create Pool</button>

      {result && (
        <div className="mt-4 bg-slate-50 p-3 rounded">
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
