import { Handle, Position } from '@xyflow/react'

const STATUS_STYLES = {
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
}

export function CursorTaskNode({ data }) {
  const status = data?.status === 'done' ? 'done' : 'pending'
  const statusClass = STATUS_STYLES[status]

  return (
    <div className="w-[300px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm touch-manipulation">
      <Handle type="target" position={Position.Left} className="!h-3 !w-3" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-slate-800">{data?.label}</p>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusClass}`}
        >
          {status}
        </span>
      </div>
      {data?.evidence ? (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{data.evidence}</p>
      ) : null}
      <Handle type="source" position={Position.Right} className="!h-3 !w-3" />
    </div>
  )
}

export function CursorChatNode({ data }) {
  return (
    <div className="w-[240px] rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2.5 touch-manipulation">
      <Handle type="source" position={Position.Right} className="!h-3 !w-3" />
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Cursor pokalbis</p>
      <p className="mt-1 line-clamp-3 text-sm font-medium text-slate-800">{data?.label}</p>
      {data?.workspace ? (
        <p className="mt-1 truncate font-mono text-[10px] text-slate-500">{data.workspace}</p>
      ) : null}
    </div>
  )
}
