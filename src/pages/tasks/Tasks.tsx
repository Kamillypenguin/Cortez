import { useState, useEffect, useRef } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon, Sparkle, CheckCircle } from '../../components/ui'
import type { CheckState } from '../../components/ui'
import { tasks as tasksApi } from '../../services/api'
import type { TaskDTO } from '../../services/api'
import { useApp } from '../../lib/context'

// ─── Constantes ────────────────────────────────────────────────────────────────
const PROJ_LIST = [
  { label: 'Estatística',       color: '#10B981' },
  { label: 'TCC · Visão',       color: '#6366F1' },
  { label: 'Iniciação Cient.',  color: '#F59E0B' },
  { label: 'Cálculo III',       color: '#EC4899' },
  { label: 'Inglês Acad.',      color: '#3B82F6' },
  { label: 'Pessoal',           color: '#8B5CF6' },
]

const PRIORITIES = [
  { value: 'urgent',    label: 'Urgente', color: '#EF4444' },
  { value: 'attention', label: 'Atenção', color: '#F59E0B' },
  { value: 'normal',    label: 'Normal',  color: '#10B981' },
]

const KANBAN_COLS = [
  { id: 'none'    as const, label: 'A fazer',      color: '#6366F1', icon: 'circle' },
  { id: 'partial' as const, label: 'Em andamento', color: '#F59E0B', icon: 'progress' },
  { id: 'done'    as const, label: 'Concluídas',   color: '#10B981', icon: 'circle-check' },
]

type KanbanStatus = 'none' | 'partial' | 'done'
type ViewMode     = 'list' | 'kanban'

// ─── Helpers ────────────────────────────────────────────────────────────────────
function projColor(proj: string) {
  return PROJ_LIST.find(p => p.label === proj)?.color ?? '#6366F1'
}

function taskStatus(t: TaskDTO): KanbanStatus {
  const s = ((t as unknown as Record<string,string>).state ?? t.status ?? 'none') as string
  if (s === 'done')    return 'done'
  if (s === 'partial') return 'partial'
  return 'none'
}

function parseDueDays(due: string): number | null {
  const s = due.toLowerCase()
  if (s.includes('hoje')   || s.includes('terça'))  return 0
  if (s.includes('amanhã') || s.includes('quarta')) return 1
  if (s.includes('quinta')) return 2
  if (s.includes('sexta'))  return 3
  const m = s.match(/(\d+)\s*(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/)
  if (m) {
    const map: Record<string,number> = {jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11}
    const diff = Math.round((new Date(2026, map[m[2]], parseInt(m[1])).getTime() - new Date(2026,4,26).getTime()) / 86400000)
    return Math.max(0, diff)
  }
  return null
}

function dueUrgency(due: string): 'red' | 'amber' | 'green' | 'neutral' {
  const d = parseDueDays(due)
  if (d === null) return 'neutral'
  if (d === 0)  return 'red'
  if (d <= 2)   return 'amber'
  if (d <= 7)   return 'green'
  return 'neutral'
}

const urgencyColors = { red: '#EF4444', amber: '#F59E0B', green: '#10B981', neutral: 'var(--tx-3)' }

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--tx-2)', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)',
  borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
}

// ─── Modal de tarefa ────────────────────────────────────────────────────────────
function TaskModal({ task, onSave, onClose }: {
  task: Partial<TaskDTO> | null
  onSave: (data: Partial<TaskDTO>) => void
  onClose: () => void
}) {
  const isNew = !task?.id
  const [title,    setTitle]    = useState(task?.titulo     ?? '')
  const [desc,     setDesc]     = useState(task?.descricao  ?? '')
  const [proj,     setProj]     = useState(task?.proj       ?? PROJ_LIST[0].label)
  const [due,      setDue]      = useState(task?.due        ?? 'Hoje')
  const [durMin,   setDurMin]   = useState(task?.durMin     ?? 30)
  const [priority, setPriority] = useState(task?.prioridade ?? 'normal')
  const [tab,      setTab]      = useState<'info' | 'details'>('info')
  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => { titleRef.current?.focus() }, [])

  const pc = projColor(proj)

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ titulo: title.trim(), descricao: desc, proj, projColor: pc, due, durMin, prioridade: priority })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 560, background: 'var(--bg-surface)', borderRadius: 18,
        border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh',
      }} onClick={e => e.stopPropagation()}>

        {/* Header + tabs */}
        <div style={{ padding: '18px 22px 0', flexShrink: 0, borderBottom: '1px solid var(--bd-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: pc }} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{isNew ? 'Nova tarefa' : 'Editar tarefa'}</h2>
            <div style={{ flex: 1 }} />
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
          <div style={{ display: 'flex' }}>
            {(['info', 'details'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px', fontSize: 13, fontWeight: tab === t ? 600 : 500,
                color: tab === t ? 'var(--tx-1)' : 'var(--tx-3)',
                borderBottom: `2px solid ${tab === t ? 'var(--c-primary)' : 'transparent'}`,
                marginBottom: -1,
              }}>
                {t === 'info' ? 'Informações' : 'Detalhes'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 22px' }}>
          {tab === 'info' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="Ex: Estudar capítulo 4 de Cálculo"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="Detalhes, links ou notas sobre esta tarefa…"
                  rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
              </div>
              <div>
                <label style={labelStyle}>Projeto / Disciplina</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PROJ_LIST.map(p => (
                    <button key={p.label} onClick={() => setProj(p.label)} style={{
                      padding: '5px 12px', borderRadius: 20,
                      border: `1px solid ${proj === p.label ? p.color : 'var(--bd-default)'}`,
                      background: proj === p.label ? `${p.color}22` : 'var(--bg-card)',
                      color: proj === p.label ? p.color : 'var(--tx-2)',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5, transition: 'all 120ms',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Prazo</label>
                  <input value={due} onChange={e => setDue(e.target.value)}
                    placeholder="Ex: Hoje · 23:59" style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
                </div>
                <div>
                  <label style={labelStyle}>Duração (min)</label>
                  <input type="number" min={5} max={480} value={durMin}
                    onChange={e => setDurMin(Number(e.target.value))} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Prioridade</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PRIORITIES.map(p => (
                    <button key={p.value} onClick={() => setPriority(p.value)} style={{
                      flex: 1, padding: '12px 0', borderRadius: 10,
                      border: `1.5px solid ${priority === p.value ? p.color : 'var(--bd-default)'}`,
                      background: priority === p.value ? `${p.color}18` : 'var(--bg-card)',
                      color: priority === p.value ? p.color : 'var(--tx-2)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 10 }}>Sessões de foco</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[15, 30, 60, 90, 120, 150, 180, 240].map(m => (
                    <button key={m} onClick={() => setDurMin(m)} style={{
                      padding: '8px 0', borderRadius: 8,
                      border: `1px solid ${durMin === m ? 'var(--c-primary)' : 'var(--bd-default)'}`,
                      background: durMin === m ? 'var(--c-primary-soft)' : 'transparent',
                      color: durMin === m ? 'var(--c-primary)' : 'var(--tx-2)',
                      fontSize: 12, fontWeight: durMin === m ? 600 : 400, cursor: 'pointer',
                    }}>
                      {m < 60 ? `${m}min` : `${m/60}h`}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${pc}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="folder" size={18} style={{ color: pc }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{proj}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>Projeto selecionado</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--bd-default)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>
            {isNew ? <><Icon name="plus" size={14} /> Criar tarefa</> : <><Icon name="check" size={14} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Linha de tarefa (list view) ────────────────────────────────────────────────
function TaskRow({ task, onCheck, onDelete, onEdit }: {
  task: TaskDTO
  onCheck: (id: string, s: CheckState) => void
  onDelete: (id: string) => void
  onEdit: (t: TaskDTO) => void
}) {
  const state     = taskStatus(task)
  const isDone    = state === 'done'
  const isPartial = state === 'partial'
  const pc        = task.projColor || projColor(task.proj)
  const urgency   = dueUrgency(task.due)

  return (
    <div onClick={() => onEdit(task)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
        borderBottom: '1px solid var(--bd-default)',
        borderLeft: `3px solid ${isDone ? 'transparent' : isPartial ? '#F59E0B' : pc}`,
        opacity: isDone ? 0.5 : 1, transition: 'opacity 200ms, background 120ms', cursor: 'pointer',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'
        ;(e.currentTarget as HTMLDivElement).querySelectorAll<HTMLElement>('.row-act').forEach(b => (b.style.opacity = '1'))
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLDivElement).querySelectorAll<HTMLElement>('.row-act').forEach(b => (b.style.opacity = '0'))
      }}
    >
      <div onClick={e => e.stopPropagation()}>
        <CheckCircle state={state} onChange={v => onCheck(task.id, v)} color={pc} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--tx-3)', lineHeight: 1.35 }}>
          {task.titulo}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: 'var(--tx-2)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} />{task.proj}
          </span>
          <span style={{ color: 'var(--tx-3)' }}>·</span>
          <span style={{ color: urgencyColors[urgency], fontWeight: urgency !== 'neutral' ? 600 : 400 }}>{task.due}</span>
          <span style={{ color: 'var(--tx-3)' }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={11} /> {task.durMin}min</span>
        </div>
      </div>
      {task.prioridade === 'urgent' && !isDone && (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 600, flexShrink: 0 }}>
          <Icon name="alert-triangle" size={11} style={{ marginRight: 3 }} />Urgente
        </span>
      )}
      {task.prioridade === 'attention' && !isDone && !isPartial && (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontWeight: 600, flexShrink: 0 }}>
          <Icon name="clock" size={11} style={{ marginRight: 3 }} />Atenção
        </span>
      )}
      {isPartial && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontWeight: 600, flexShrink: 0 }}>Em andamento</span>}
      {isDone    && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 600, flexShrink: 0 }}>Feita</span>}
      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
        <button className="row-act icon-btn" style={{ opacity: 0, transition: 'opacity 150ms' }} onClick={() => onEdit(task)} title="Editar">
          <Icon name="pencil" size={13} />
        </button>
        <button className="row-act icon-btn" style={{ opacity: 0, transition: 'opacity 150ms', color: 'var(--c-danger)' }} onClick={() => onDelete(task.id)} title="Excluir">
          <Icon name="trash" size={13} />
        </button>
      </div>
    </div>
  )
}

function KanbanCard({ task, onCheck, onDelete, onEdit }: {
  task: TaskDTO; onCheck: (id: string, s: CheckState) => void
  onDelete: (id: string) => void; onEdit: (t: TaskDTO) => void
}) {
  const state   = taskStatus(task)
  const isDone  = state === 'done'
  const pc      = task.projColor || projColor(task.proj)
  const urgency = dueUrgency(task.due)
  return (
    <div onClick={() => onEdit(task)}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--bd-default)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'box-shadow 150ms, transform 150ms', opacity: isDone ? 0.55 : 1, borderTop: `3px solid ${pc}` }}
      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLDivElement).querySelectorAll<HTMLElement>('.kc-act').forEach(b => (b.style.opacity = '1')) }}
      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).querySelectorAll<HTMLElement>('.kc-act').forEach(b => (b.style.opacity = '0')) }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div onClick={e => e.stopPropagation()} style={{ paddingTop: 1 }}>
          <CheckCircle state={state} onChange={v => onCheck(task.id, v)} color={pc} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--tx-3)' }}>{task.titulo}</div>
          {task.descricao && <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.descricao}</div>}
        </div>
        <div onClick={e => e.stopPropagation()}>
          <button className="kc-act icon-btn" onClick={() => onDelete(task.id)} style={{ opacity: 0, transition: 'opacity 150ms', width: 22, height: 22, color: 'var(--c-danger)' }}><Icon name="trash" size={12} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: `${pc}18`, color: pc, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc }} />{task.proj}
        </span>
        <span style={{ fontSize: 11, color: urgencyColors[urgency], display: 'flex', alignItems: 'center', gap: 3, fontWeight: urgency !== 'neutral' ? 600 : 400 }}>
          <Icon name="calendar-event" size={10} />{task.due}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--tx-3)', display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={10} />{task.durMin}min</span>
        {task.prioridade === 'urgent'    && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} title="Urgente" />}
        {task.prioridade === 'attention' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} title="Atenção" />}
      </div>
    </div>
  )
}

function KanbanColumn({ col, tasks, onCheck, onDelete, onEdit, onAdd }: {
  col: typeof KANBAN_COLS[number]; tasks: TaskDTO[]
  onCheck: (id: string, s: CheckState) => void; onDelete: (id: string) => void
  onEdit: (t: TaskDTO) => void; onAdd: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 280, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: '10px 10px 0 0', border: '1px solid var(--bd-default)', borderBottom: 'none', borderTop: `3px solid ${col.color}` }}>
        <Icon name={col.icon} size={16} style={{ color: col.color }} />
        <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{col.label}</span>
        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 99, background: `${col.color}20`, color: col.color, fontWeight: 700 }}>{tasks.length}</span>
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 140 }}>
        {tasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--tx-3)', fontSize: 12 }}><Icon name="inbox" size={20} style={{ display: 'block', margin: '0 auto 6px', opacity: 0.4 }} />Vazio</div>}
        {tasks.map(t => <KanbanCard key={t.id} task={t} onCheck={onCheck} onDelete={onDelete} onEdit={onEdit} />)}
        <button onClick={onAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, border: '1px dashed var(--bd-default)', background: 'transparent', color: 'var(--tx-3)', fontSize: 12, cursor: 'pointer', width: '100%', marginTop: 2, transition: 'all 120ms' }}
          onMouseOver={e => { (e.currentTarget.style.color = col.color); (e.currentTarget.style.borderColor = col.color) }}
          onMouseOut={e => { (e.currentTarget.style.color = 'var(--tx-3)'); (e.currentTarget.style.borderColor = 'var(--bd-default)') }}
        >
          <Icon name="plus" size={13} /> Adicionar tarefa
        </button>
      </div>
    </div>
  )
}

type Filters = { search: string; proj: string | null; priority: string | null; tab: string }

function filterTasks(tasks: TaskDTO[], f: Filters): TaskDTO[] {
  let list = [...tasks]
  if (f.search) { const q = f.search.toLowerCase(); list = list.filter(t => t.titulo.toLowerCase().includes(q) || t.proj.toLowerCase().includes(q)) }
  if (f.proj)     list = list.filter(t => t.proj === f.proj)
  if (f.priority) list = list.filter(t => t.prioridade === f.priority)
  if (f.tab === 'hoje')       list = list.filter(t => ['hoje','today'].some(k => t.due.toLowerCase().includes(k)))
  if (f.tab === 'urgentes')   list = list.filter(t => t.prioridade === 'urgent' && taskStatus(t) !== 'done')
  if (f.tab === 'concluidas') list = list.filter(t => taskStatus(t) === 'done')
  return list
}

export function Tasks() {
  const { user } = useApp()
  const [taskList, setTaskList] = useState<TaskDTO[]>([])
  const [loading,  setLoading]  = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [modal,    setModal]    = useState<{ task: Partial<TaskDTO> | null; open: boolean }>({ task: null, open: false })
  const [filters,  setFilters]  = useState<Filters>({ search: '', proj: null, priority: null, tab: 'todas' })

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    tasksApi.list().then(setTaskList).catch(console.error).finally(() => setLoading(false))
  }, [userId])

  const handleSave = async (data: Partial<TaskDTO>) => {
    if (modal.task?.id) {
      try {
        const updated = await tasksApi.update(modal.task.id, { titulo: data.titulo, proj: data.proj, projColor: data.projColor, prioridade: data.prioridade, due: data.due, durMin: data.durMin })
        setTaskList(prev => prev.map(t => t.id === updated.id ? updated : t))
      } catch (err) { console.error(err) }
    } else {
      try {
        const created = await tasksApi.create({ titulo: data.titulo!, proj: data.proj!, projColor: data.projColor, prioridade: data.prioridade, due: data.due!, durMin: data.durMin })
        setTaskList(prev => [...prev, created])
      } catch (err) { console.error(err) }
    }
  }

  const handleCheck = async (id: string, state: CheckState) => {
    setTaskList(prev => prev.map(t => t.id === id ? { ...t, state, status: state } as TaskDTO : t))
    try { await tasksApi.update(id, { status: state }) } catch {}
  }

  const handleDelete = async (id: string) => {
    setTaskList(prev => prev.filter(t => t.id !== id))
    try { await tasksApi.remove(id) } catch {}
  }

  const openNew    = (defaults?: Partial<TaskDTO>) => setModal({ task: defaults ?? null, open: true })
  const openEdit   = (t: TaskDTO) => setModal({ task: t, open: true })
  const closeModal = () => setModal({ task: null, open: false })

  const filtered   = filterTasks(taskList, filters)
  const projList   = [...new Set(taskList.map(t => t.proj))]
  const done       = taskList.filter(t => taskStatus(t) === 'done').length
  const urgent     = taskList.filter(t => t.prioridade === 'urgent' && taskStatus(t) !== 'done').length
  const todayCount = taskList.filter(t => t.due.toLowerCase().includes('hoje')).length
  const total      = taskList.length
  const kanbanCols = KANBAN_COLS.map(col => ({ ...col, tasks: filtered.filter(t => taskStatus(t) === col.id) }))
  const TABS = [
    { id: 'todas', label: 'Todas', count: total },
    { id: 'hoje', label: 'Hoje', count: todayCount },
    { id: 'urgentes', label: 'Urgentes', count: urgent },
    { id: 'concluidas', label: 'Concluídas', count: done },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Tarefas</h1>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-card)', color: 'var(--tx-2)', fontWeight: 600, border: '1px solid var(--bd-default)' }}>
            {taskList.filter(t => taskStatus(t) !== 'done').length} ativas
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ width: 240, height: 34, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
            <Icon name="search" size={13} style={{ color: 'var(--tx-3)' }} />
            <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Buscar tarefa…" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--tx-1)', fontSize: 13, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['list', 'kanban'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{ width: 32, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === v ? 'var(--bg-surface)' : 'transparent', color: viewMode === v ? 'var(--tx-1)' : 'var(--tx-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms', boxShadow: viewMode === v ? '0 1px 4px rgba(0,0,0,0.25)' : 'none' }} title={v === 'list' ? 'Lista' : 'Kanban'}>
                <Icon name={v === 'list' ? 'list' : 'layout-columns'} size={15} />
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => openNew()}><Icon name="plus" size={14} /> Nova tarefa</button>
        </header>

        <div className="scroll" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {urgent > 0 && (
            <div style={{ margin: '20px 24px 0', background: 'linear-gradient(135deg,rgba(239,68,68,.10),rgba(239,68,68,.04))', border: '1px solid rgba(239,68,68,.28)', borderLeft: '3px solid #EF4444', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="alert-triangle" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{urgent} tarefa{urgent > 1 ? 's urgentes' : ' urgente'} pendente{urgent > 1 ? 's' : ''}.</div>
                <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>Priorize agora para não perder o prazo.</div>
              </div>
              <button className="btn btn-sm btn-ai"><Sparkle size={12} /> Priorizar dia</button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '20px 24px 0' }}>
            {[
              { label: 'Total', value: total, color: 'var(--c-primary)', icon: 'checklist' },
              { label: 'Hoje', value: todayCount, color: '#F59E0B', icon: 'calendar-event' },
              { label: 'Urgentes', value: urgent, color: '#EF4444', icon: 'alert-triangle' },
              { label: 'Concluídas', value: done, color: '#10B981', icon: 'circle-check' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={16} style={{ color: s.color }} />
                </div>
                <div><div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div><div style={{ fontSize: 11, color: 'var(--tx-3)', fontWeight: 500 }}>{s.label}</div></div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--bd-default)', flex: 1 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setFilters(f => ({ ...f, tab: t.id }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 14px', fontSize: 13, fontWeight: filters.tab === t.id ? 600 : 500, color: filters.tab === t.id ? 'var(--tx-1)' : 'var(--tx-2)', borderBottom: `2px solid ${filters.tab === t.id ? 'var(--c-primary)' : 'transparent'}`, marginBottom: -1, transition: 'all 120ms', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.label}
                  <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 99, background: filters.tab === t.id ? 'var(--c-primary-soft)' : 'var(--bg-card)', color: filters.tab === t.id ? 'var(--c-primary)' : 'var(--tx-3)' }}>{t.count}</span>
                </button>
              ))}
            </div>
            <select value={filters.proj ?? ''} onChange={e => setFilters(f => ({ ...f, proj: e.target.value || null }))} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
              <option value="">Todos os projetos</option>
              {projList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.priority ?? ''} onChange={e => setFilters(f => ({ ...f, priority: e.target.value || null }))} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
              <option value="">Toda prioridade</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--tx-3)', gap: 10 }}>
              <Icon name="loader" size={24} style={{ opacity: 0.5 }} /> Carregando tarefas...
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ margin: '20px 24px 32px' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}</h3>
                  {filters.proj && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-surface)', color: 'var(--tx-2)', border: '1px solid var(--bd-default)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: projColor(filters.proj) }} />{filters.proj}
                      <button onClick={() => setFilters(f => ({ ...f, proj: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 0, display: 'flex' }}><Icon name="x" size={11} /></button>
                    </span>
                  )}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>Ordenado por urgência</span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--tx-3)', fontSize: 13 }}>
                    <Icon name="checklist" size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                    Nenhuma tarefa encontrada<br />
                    <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => openNew()}><Icon name="plus" size={13} /> Nova tarefa</button>
                  </div>
                ) : (
                  filtered
                    .sort((a, b) => { const po: Record<string, number> = { urgent: 0, attention: 1, normal: 2 }; return (po[a.prioridade] ?? 2) - (po[b.prioridade] ?? 2) })
                    .map(t => <TaskRow key={t.id} task={t} onCheck={handleCheck} onDelete={handleDelete} onEdit={openEdit} />)
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, padding: '20px 24px 32px', flex: 1, minHeight: 0, overflowX: 'auto' }}>
              {kanbanCols.map(col => <KanbanColumn key={col.id} col={col} tasks={col.tasks} onCheck={handleCheck} onDelete={handleDelete} onEdit={openEdit} onAdd={() => openNew({ prioridade: 'normal' })} />)}
            </div>
          )}
        </div>
      </main>
      {modal.open && <TaskModal task={modal.task} onSave={handleSave} onClose={closeModal} />}
    </div>
  )
}
