import React from 'react'
import { getCB, getBanked, bank, applyBank } from '../api'

export default function BankingPage(){
  const [shipId,setShipId] = React.useState('R001')
  const [year,setYear] = React.useState<number>(2024)
  const [cb,setCb] = React.useState<number|null>(null)
  const [banked,setBanked] = React.useState<number|null>(null)
  const [amount,setAmount] = React.useState<number>(0)
  const [loading,setLoading] = React.useState(false)

  async function load(){
    setLoading(true)
    try{
      const cbRes:any = await getCB(shipId, year)
      setCb(cbRes.cb_tonnes ?? cbRes.cb_before ?? 0)
      const bankRes:any = await getBanked(shipId, year)
      setBanked(bankRes.banked ?? 0)
    }finally{ setLoading(false) }
  }

  React.useEffect(()=>{ load() }, [])

  async function onBank(e:any){
    e.preventDefault()
    await bank(shipId, year, amount)
    await load()
  }

  async function onApply(e:any){
    e.preventDefault()
    await applyBank(shipId, year, amount)
    await load()
  }

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl">
      <h2 className="text-2xl font-semibold mb-3">Banking</h2>
      <p className="text-sm text-slate-600 mb-4">Manage banked credits for a ship and apply them to compliance.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-slate-600">Ship</label>
          <input value={shipId} onChange={e=>setShipId(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Year</label>
          <input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} className="border rounded px-3 py-2 w-full" />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="p-3 bg-slate-50 rounded w-1/2">
          <div className="text-sm text-slate-500">Calculated CB</div>
          <div className="font-medium text-lg">{cb ?? '—'}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded w-1/2">
          <div className="text-sm text-slate-500">Banked</div>
          <div className="font-medium text-lg">{banked ?? '—'}</div>
        </div>
      </div>

      <form className="flex gap-2 items-center" onSubmit={onBank}>
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="border rounded px-3 py-2 w-32" />
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Bank</button>
        <button type="button" className="bg-sky-600 text-white px-4 py-2 rounded" onClick={onApply}>Apply</button>
      </form>
    </div>
  )
}
