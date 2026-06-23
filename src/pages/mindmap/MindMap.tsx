import { useState, useRef, useEffect, useCallback } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon } from '../../components/ui'
import { mindmaps as mindmapsApi, type MindMapDTO } from '../../services/api'
import { useApp } from '../../lib/context'

// ─── Tipos ──────────────────────────────────────────────────────────────────────
interface MMNode {
  id: string; label: string; x: number; y: number
  color: string; parentId: string | null; collapsed: boolean
  shape: 'oval' | 'rect' | 'diamond'
}

interface MMEdge { from: string; to: string }

interface MindMapData { id: string; title: string; nodes: MMNode[]; edges: MMEdge[] }

// ─── Cores padrão ───────────────────────────────────────────────────────────────
const NODE_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899',
  '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6',
]

// ─── Conversão DTO ↔ MindMapData ────────────────────────────────────────────────
function dtoToData(dto: MindMapDTO): MindMapData {
  try {
    const parsed = JSON.parse(dto.estrutura || '{}')
    return { id: dto.id, title: dto.titulo, nodes: parsed.nodes ?? [], edges: parsed.edges ?? [] }
  } catch {
    return { id: dto.id, title: dto.titulo, nodes: [], edges: [] }
  }
}

function dataToEstrutura(data: MindMapData): string {
  return JSON.stringify({ nodes: data.nodes, edges: data.edges })
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function uid() { return `n${Date.now()}${Math.random().toString(36).slice(2, 6)}` }

function visibleNodes(nodes: MMNode[], edges: MMEdge[]): Set<string> {
  const visible = new Set<string>()
  function add(id: string) {
    visible.add(id)
    const node = nodes.find(n => n.id === id)
    if (node?.collapsed) return
    edges.filter(e => e.from === id).forEach(e => add(e.to))
  }
  nodes.filter(n => n.parentId === null).forEach(n => add(n.id))
  return visible
}

// ─── Nó do mapa ────────────────────────────────────────────────────────────────
function NodeEl({ node, selected, onMouseDown, onDoubleClick, onAddChild, hasChildren }: {
  node: MMNode; selected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onDoubleClick: () => void
  onAddChild: () => void
  hasChildren: boolean
}) {
  const W = node.label.length > 14 ? 130 : 110
  const H = node.label.includes('\n') ? 52 : 36
  const isRoot = node.parentId === null

  const shapeStyle: React.CSSProperties = node.shape === 'oval' ? { borderRadius: 99 }
    : node.shape === 'diamond' ? { transform: 'rotate(45deg)', borderRadius: 6 }
    : { borderRadius: 8 }

  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      {selected && (
        <rect x={-W / 2 - 4} y={-H / 2 - 4} width={W + 8} height={H + 8}
          rx={node.shape === 'oval' ? 99 : 10}
          fill="none" stroke={node.color} strokeWidth={2} strokeDasharray="4 3" opacity={0.7}
        />
      )}
      <foreignObject x={-W / 2} y={-H / 2} width={W} height={H}>
        <div
          onMouseDown={e => { e.stopPropagation(); onMouseDown(e) }}
          onDoubleClick={e => { e.stopPropagation(); onDoubleClick() }}
          style={{
            width: W, height: H,
            background: `${node.color}${isRoot ? 'EE' : '28'}`,
            border: `2px solid ${node.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', cursor: 'grab', userSelect: 'none',
            fontSize: isRoot ? 13 : 12, fontWeight: isRoot ? 700 : 600,
            color: isRoot ? 'white' : node.color,
            padding: '4px 8px', lineHeight: 1.3,
            whiteSpace: 'pre-wrap', boxSizing: 'border-box',
            ...shapeStyle,
          }}
        >
          {node.label}
        </div>
      </foreignObject>
      <g transform={`translate(${W / 2 + 4}, 0)`}
        style={{ cursor: 'pointer', opacity: selected ? 1 : 0.3 }}
        onClick={e => { e.stopPropagation(); onAddChild() }}
      >
        <circle r={10} fill={node.color} opacity={0.9} />
        <text x={0} y={4} textAnchor="middle" fontSize={14} fill="white" fontWeight={700}>+</text>
      </g>
      {hasChildren && (
        <g transform={`translate(0, ${H / 2 + 10})`} style={{ cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); onDoubleClick() }}
        >
          <circle r={7} fill="var(--bg-surface)" stroke={node.color} strokeWidth={1.5} />
          <text x={0} y={4} textAnchor="middle" fontSize={10} fill={node.color}>{node.collapsed ? '+' : '−'}</text>
        </g>
      )}
    </g>
  )
}

// ─── Editor de nó ──────────────────────────────────────────────────────────────
function NodeEditor({ node, onSave, onDelete, onClose }: {
  node: MMNode; onSave: (n: Partial<MMNode>) => void; onDelete: () => void; onClose: () => void
}) {
  const [label, setLabel] = useState(node.label.replace('\n', ' '))
  const [color, setColor] = useState(node.color)
  const [shape, setShape] = useState(node.shape)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])

  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg-surface)', border: '1px solid var(--bd-strong)', borderRadius: 14,
      padding: '16px 18px', boxShadow: 'var(--sh-3)', width: 340, zIndex: 50,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Editar nó</span>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <input ref={ref} value={label} onChange={e => setLabel(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (onSave({ label, color, shape }), onClose())}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
      />
      <div>
        <div style={{ fontSize: 11, color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Cor</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {NODE_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 24, height: 24, borderRadius: '50%', border: color === c ? '3px solid var(--tx-1)' : '3px solid transparent',
              background: c, cursor: 'pointer', outline: 'none', padding: 0,
              boxShadow: color === c ? `0 0 0 2px ${c}55` : 'none',
            }} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Forma</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['oval', 'rect', 'diamond'] as const).map(s => (
            <button key={s} onClick={() => setShape(s)} style={{
              flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 500,
              border: `1.5px solid ${shape === s ? 'var(--c-primary)' : 'var(--bd-default)'}`,
              background: shape === s ? 'var(--c-primary-soft)' : 'var(--bg-card)',
              color: shape === s ? 'var(--c-primary)' : 'var(--tx-2)', cursor: 'pointer',
            }}>
              {s === 'oval' ? 'Oval' : s === 'rect' ? 'Retângulo' : 'Diamante'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" style={{ color: 'var(--c-danger)', borderColor: 'rgba(239,68,68,.3)', fontSize: 12 }} onClick={onDelete}>
          <Icon name="trash" size={13} /> Excluir
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: 12 }}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { onSave({ label, color, shape }); onClose() }} style={{ fontSize: 12 }}>
            <Icon name="check" size={13} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Canvas principal ───────────────────────────────────────────────────────────
function MapCanvas({ map, onChange }: { map: MindMapData; onChange: (m: MindMapData) => void }) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const [pan,    setPan]    = useState({ x: 0, y: 0 })
  const [scale,  setScale]  = useState(1)
  const [selId,  setSelId]  = useState<string | null>(null)
  const [editing,setEditing]= useState<string | null>(null)
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null)
  const panning  = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null)

  const { nodes, edges } = map
  const visible = visibleNodes(nodes, edges)

  const setNodes = (fn: (ns: MMNode[]) => MMNode[]) => onChange({ ...map, nodes: fn(nodes) })
  const setEdges = (fn: (es: MMEdge[]) => MMEdge[]) => onChange({ ...map, edges: fn(edges) })

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.min(3, Math.max(0.2, s * (e.deltaY < 0 ? 1.08 : 0.93))))
  }

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const rect = svgRef.current!.getBoundingClientRect()
    const node = nodes.find(n => n.id === id)!
    dragging.current = { id, ox: (e.clientX - rect.left - pan.x) / scale - node.x, oy: (e.clientY - rect.top - pan.y) / scale - node.y }
    setSelId(id)
  }

  const onSvgMouseDown = (e: React.MouseEvent) => {
    if (dragging.current) return
    panning.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }
    setSelId(null)
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragging.current) {
      const rect = svgRef.current!.getBoundingClientRect()
      const x = (e.clientX - rect.left - pan.x) / scale - dragging.current.ox
      const y = (e.clientY - rect.top  - pan.y) / scale - dragging.current.oy
      setNodes(ns => ns.map(n => n.id === dragging.current!.id ? { ...n, x, y } : n))
    } else if (panning.current) {
      setPan({ x: panning.current.px + e.clientX - panning.current.sx, y: panning.current.py + e.clientY - panning.current.sy })
    }
  }, [pan, scale])

  const onMouseUp = useCallback(() => { dragging.current = null; panning.current = null }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [onMouseMove, onMouseUp])

  const addChild = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId)!
    const siblings = edges.filter(e => e.from === parentId).length
    const id = uid()
    const childColor = NODE_COLORS[(NODE_COLORS.indexOf(parent.color) + 1) % NODE_COLORS.length]
    const newNode: MMNode = { id, label: 'Novo nó', parentId, x: parent.x + 200, y: parent.y + siblings * 60 - 30, color: childColor, collapsed: false, shape: 'oval' }
    setNodes(ns => [...ns, newNode])
    setEdges(es => [...es, { from: parentId, to: id }])
    setSelId(id); setEditing(id)
  }

  const toggleCollapse = (id: string) => setNodes(ns => ns.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n))

  const deleteNode = (id: string) => {
    const toDelete = new Set<string>()
    const collect = (nid: string) => { toDelete.add(nid); edges.filter(e => e.from === nid).forEach(e => collect(e.to)) }
    collect(id)
    setNodes(ns => ns.filter(n => !toDelete.has(n.id)))
    setEdges(es => es.filter(e => !toDelete.has(e.from) && !toDelete.has(e.to)))
    setSelId(null)
  }

  const saveEdit = (id: string, partial: Partial<MMNode>) => setNodes(ns => ns.map(n => n.id === id ? { ...n, ...partial } : n))

  function edgePath(from: MMNode, to: MMNode) {
    const mx = (from.x + to.x) / 2
    return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`
  }

  const selNode  = nodes.find(n => n.id === selId)
  const editNode = nodes.find(n => n.id === editing)

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % 32},${pan.y % 32}) scale(${scale})`}>
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--bd-default)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <svg ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: panning.current ? 'grabbing' : 'default' }}
        onMouseDown={onSvgMouseDown} onWheel={onWheel}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {edges.map(e => {
            const from = nodes.find(n => n.id === e.from)
            const to   = nodes.find(n => n.id === e.to)
            if (!from || !to || !visible.has(e.from) || !visible.has(e.to)) return null
            return <path key={`${e.from}-${e.to}`} d={edgePath(from, to)} fill="none" stroke={from.color} strokeWidth={1.5} opacity={0.5} strokeLinecap="round" />
          })}
          {nodes.filter(n => visible.has(n.id)).map(node => (
            <NodeEl key={node.id} node={node} selected={selId === node.id}
              onMouseDown={e => onNodeMouseDown(e, node.id)}
              onDoubleClick={() => { if (node.parentId !== null) toggleCollapse(node.id); else setEditing(node.id) }}
              onAddChild={() => addChild(node.id)}
              hasChildren={edges.some(e => e.from === node.id)}
            />
          ))}
        </g>
      </svg>

      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="icon-btn" onClick={() => setScale(s => Math.min(3, s * 1.2))} title="Zoom in"><Icon name="plus" size={16} /></button>
        <button className="icon-btn" onClick={() => { setScale(1); setPan({ x: 0, y: 0 }) }} title="Reset"><Icon name="maximize" size={14} /></button>
        <button className="icon-btn" onClick={() => setScale(s => Math.max(0.2, s / 1.2))} title="Zoom out"><Icon name="minus" size={16} /></button>
      </div>

      {selNode && !editing && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'var(--tx-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: selNode.color }} />
          <strong>{selNode.label.replace('\n', ' ')}</strong>
          <button className="btn btn-sm btn-secondary" onClick={() => setEditing(selNode.id)}><Icon name="pencil" size={11} /> Editar</button>
          {selNode.parentId !== null && (
            <button className="btn btn-sm btn-secondary" style={{ color: 'var(--c-danger)' }} onClick={() => deleteNode(selNode.id)}><Icon name="trash" size={11} /> Excluir</button>
          )}
        </div>
      )}

      {editing && editNode && (
        <NodeEditor node={editNode}
          onSave={p => saveEdit(editNode.id, p)}
          onDelete={() => { deleteNode(editNode.id); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ─── Item da lista ──────────────────────────────────────────────────────────────
function MapListItem({ map, active, onSelect, onDelete, onRename, canDelete }: {
  map: MindMapData; active: boolean
  onSelect: () => void; onDelete: () => void
  onRename: (titulo: string) => void; canDelete: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [title,   setTitle]   = useState(map.title)

  const commit = () => {
    setEditing(false)
    if (title.trim() && title.trim() !== map.title) onRename(title.trim())
    else setTitle(map.title)
  }

  return (
    <div
      onClick={() => { if (!editing) onSelect() }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, background: active ? 'var(--c-primary-soft)' : 'transparent', cursor: 'pointer', transition: 'background 120ms', marginBottom: 2 }}
      onMouseOver={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)' }}
      onMouseOut={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <Icon name="brain" size={15} style={{ color: active ? 'var(--c-primary)' : 'var(--tx-3)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input value={title} onChange={e => setTitle(e.target.value)} onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setTitle(map.title) } }}
            autoFocus onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--c-primary)', borderRadius: 4, padding: '2px 6px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
          />
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: active ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: active ? 'var(--c-primary)' : 'var(--tx-1)' }}>{map.title}</div>
            <div style={{ fontSize: 10, color: 'var(--tx-3)' }}>{map.nodes.length} nós</div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setEditing(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 2, opacity: 0, transition: 'opacity 120ms', display: 'flex' }}
          onMouseOver={e => (e.currentTarget.style.opacity = '1')} onMouseOut={e => (e.currentTarget.style.opacity = '0')}>
          <Icon name="pencil" size={11} />
        </button>
        {canDelete && (
          <button onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 2, opacity: 0, transition: 'opacity 120ms', display: 'flex' }}
            onMouseOver={e => (e.currentTarget.style.opacity = '1')} onMouseOut={e => (e.currentTarget.style.opacity = '0')}>
            <Icon name="trash" size={11} style={{ color: 'var(--c-danger)' }} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────────
export function MindMap() {
  const { user } = useApp()
  const [maps,    setMaps]    = useState<MindMapData[]>([])
  const [current, setCurrent] = useState<MindMapData | null>(null)
  const [newTitle,setNewTitle]= useState('')
  const [showNew, setShowNew] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    mindmapsApi.list().then(dtos => {
      const loaded = dtos.map(dtoToData)
      setMaps(loaded)
      if (loaded.length > 0) setCurrent(loaded[0])
    }).catch(console.error)
  }, [userId])

  const persistUpdate = useCallback((data: MindMapData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try { setSaving(true); await mindmapsApi.update(data.id, { estrutura: dataToEstrutura(data) }) }
      catch { /* silencioso */ } finally { setSaving(false) }
    }, 800)
  }, [])

  const updateMap = (m: MindMapData) => {
    setCurrent(m)
    setMaps(prev => prev.map(x => x.id === m.id ? m : x))
    persistUpdate(m)
  }

  const createMap = async () => {
    if (!newTitle.trim()) return
    try {
      const rootNode: MMNode = { id: uid(), label: newTitle.trim(), x: 0, y: 0, color: '#6366F1', parentId: null, collapsed: false, shape: 'oval' }
      const dto = await mindmapsApi.create({ titulo: newTitle.trim(), estrutura: JSON.stringify({ nodes: [rootNode], edges: [] }) })
      const data = dtoToData(dto)
      setMaps(prev => [data, ...prev])
      setCurrent(data)
      setNewTitle(''); setShowNew(false)
    } catch (err) { console.error(err) }
  }

  const deleteMap = async (id: string) => {
    try {
      await mindmapsApi.remove(id)
      const next = maps.filter(m => m.id !== id)
      setMaps(next)
      if (current?.id === id) setCurrent(next[0] ?? null)
    } catch { /* silencioso */ }
  }

  const renameMap = async (id: string, titulo: string) => {
    try {
      await mindmapsApi.update(id, { titulo })
      setMaps(prev => prev.map(m => m.id === id ? { ...m, title: titulo } : m))
      if (current?.id === id) setCurrent(prev => prev ? { ...prev, title: titulo } : prev)
    } catch { /* silencioso */ }
  }

  const exportSVG = () => {
    const svg = document.querySelector('.mm-canvas svg')
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `${current?.title ?? 'mapa'}.svg`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Mapas Mentais</h1>
          {saving && <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>Salvando…</span>}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={exportSVG}><Icon name="download" size={14} /> Exportar SVG</button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Icon name="plus" size={14} /> Novo mapa</button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          <div style={{ width: 220, borderRight: '1px solid var(--bd-default)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: '12px 14px 8px', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--tx-3)' }}>Seus mapas</div>
            </div>

            {showNew && (
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--bd-default)' }}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createMap(); if (e.key === 'Escape') { setShowNew(false); setNewTitle('') } }}
                  placeholder="Título do mapa…" autoFocus
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--c-primary)', borderRadius: 6, padding: '6px 8px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={createMap}>Criar</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => { setShowNew(false); setNewTitle('') }}>✕</button>
                </div>
              </div>
            )}

            <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '6px 8px' }}>
              {maps.length === 0 && !showNew && (
                <div style={{ padding: '12px 10px', fontSize: 12, color: 'var(--tx-3)' }}>Nenhum mapa ainda</div>
              )}
              {maps.map(m => (
                <MapListItem key={m.id} map={m} active={current?.id === m.id}
                  onSelect={() => setCurrent(m)}
                  onDelete={() => deleteMap(m.id)}
                  onRename={titulo => renameMap(m.id, titulo)}
                  canDelete={maps.length > 1}
                />
              ))}
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--bd-default)', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--tx-3)', lineHeight: 1.8 }}>
                <div><strong>Dbl-click</strong> — colapsar/editar nó</div>
                <div><strong>Drag</strong> — mover nó</div>
                <div><strong>Scroll</strong> — zoom</div>
                <div><strong>+</strong> no nó — adicionar filho</div>
              </div>
            </div>
          </div>

          <div className="mm-canvas" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {current ? (
              <>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-surface)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="brain" size={16} style={{ color: 'var(--c-primary)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{current.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{current.nodes.length} nós · {current.edges.length} conexões</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>Clique no <strong>+</strong> de qualquer nó para adicionar um filho</span>
                </div>
                <MapCanvas map={current} onChange={updateMap} />
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--tx-3)' }}>
                <Icon name="brain" size={40} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>Crie um mapa mental para começar</div>
                <button className="btn btn-primary" onClick={() => setShowNew(true)}><Icon name="plus" size={14} /> Novo mapa</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
