import { ReactFlowProvider } from '@xyflow/react'
import CursorTaskMapCanvas from './components/CursorTaskMapCanvas.jsx'

export default function App() {
  return (
    <div className="flex h-full w-full flex-col">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-2">
        <h1 className="text-sm font-semibold text-slate-800">Cursor užduočių žemėlapis</h1>
        <p className="text-xs text-slate-500">Asmeninis · tik jūsų Vercel account</p>
      </header>
      <main className="min-h-0 flex-1">
        <ReactFlowProvider>
          <CursorTaskMapCanvas />
        </ReactFlowProvider>
      </main>
    </div>
  )
}
