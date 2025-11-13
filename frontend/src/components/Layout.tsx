import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <header className="bg-white/60 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">FuelEU Maritime</h1>
            <p className="text-sm text-slate-500">Compliance dashboard & route comparison</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Status: <span className="font-medium text-sky-600">OK</span></span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        {children}
      </div>

      <footer className="mt-12 py-6 border-t bg-white/40">
        <div className="max-w-6xl mx-auto px-6 text-sm text-slate-500">© FuelEU Maritime — Demo dashboard</div>
      </footer>
    </div>
  )
}
