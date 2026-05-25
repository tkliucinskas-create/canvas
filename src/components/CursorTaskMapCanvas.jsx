import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CursorTaskNode, CursorChatNode } from './CursorTaskNode.jsx'

const STORAGE_KEY = 'cursor-task-map-layout-v1'
const DATA_URL = '/cursor-task-map/react-flow-nodes.json'

const nodeTypes = {
  cursorTask: CursorTaskNode,
  cursorChat: CursorChatNode,
}

function applyStoredPositions(nodes) {
  if (typeof window === 'undefined') return nodes
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return nodes
    const positions = JSON.parse(raw)
    return nodes.map((n) =>
      positions[n.id] ? { ...n, position: positions[n.id] } : n,
    )
  } catch {
    return nodes
  }
}

export default function CursorTaskMapCanvas() {
  const [loadError, setLoadError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const loadGraph = useCallback(async () => {
    setLoadError(null)
    try {
      const res = await fetch(`${DATA_URL}?t=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMeta(data.meta || null)
      setNodes(applyStoredPositions(data.nodes || []))
      setEdges(data.edges || [])
    } catch (err) {
      setLoadError(err.message || 'Nepavyko įkelti react-flow-nodes.json')
    }
  }, [setNodes, setEdges])

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

  const saveLayout = useCallback(() => {
    const positions = Object.fromEntries(nodes.map((n) => [n.id, n.position]))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  }, [nodes])

  const exportLayout = useCallback(() => {
    const payload = {
      nodes,
      edges,
      meta: {
        ...meta,
        layoutSavedAt: new Date().toISOString(),
        savedFrom: 'browser',
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cursor-task-map-layout.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges, meta])

  const stats = useMemo(() => {
    const tasks = nodes.filter((n) => n.type === 'cursorTask')
    const done = tasks.filter((n) => n.data?.status === 'done').length
    return { total: tasks.length, done, pending: tasks.length - done }
  }, [nodes])

  return (
    <div className="h-full w-full touch-pan-y">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        panOnDrag
        panOnScroll
        zoomOnPinch
        zoomOnScroll
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        selectionOnDrag={false}
        className="cursor-task-map-flow"
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} className="!rounded-lg !shadow-md" />
        <MiniMap
          pannable
          zoomable
          className="!rounded-lg !border !border-slate-200 !bg-white/90"
          nodeColor={(n) => (n.type === 'cursorTask' ? '#6366f1' : '#818cf8')}
        />
        <Panel position="top-left" className="m-3 max-w-sm rounded-lg border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur">
          <p className="mt-1 text-xs text-slate-600">
            Tempk mazgus iPad — išdėstymas išsaugomas šioje naršyklėje.
          </p>
          {loadError ? (
            <p className="mt-2 text-xs text-red-600">{loadError}</p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Užduotys: {stats.total} · atlikta {stats.done} · laukia {stats.pending}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveLayout}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 active:bg-slate-100"
            >
              Išsaugoti išdėstymą
            </button>
            <button
              type="button"
              onClick={loadGraph}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 active:bg-slate-100"
            >
              Perkrauti JSON
            </button>
            <button
              type="button"
              onClick={exportLayout}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 active:bg-indigo-100"
            >
              Eksportuoti
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
