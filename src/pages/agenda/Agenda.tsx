import { useState, useRef, useEffect, useCallback } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon } from '../../components/ui'
import { events as eventsApi } from '../../services/api'
import type { EventDTO } from '../../services/api'
import { useApp } from '../../lib/context'

// ─── Constantes ────────────────────────────────────────────────────────────────
const HOUR_HEIGHT = 64
const DAY_START   = 7
const DAY_END     = 22
const TOTAL_HOURS = DAY_END - DAY_START

const EVENT_COLORS = [
  { label: 'Índigo',  value: '#6366F1' },
  { label: 'Verde',   value: '#10B981' },
  { label: 'Âmbar',  value: '#F59E0B' },
  { label: 'Rosa',    value: '#EC4899' },
  { label: 'Azul',   value: '#3B82F6' },
  { label: 'Roxo',   value: '#8B5CF6' },
  { label: 'Coral',  value: '#EF4444' },
]

// ─── Tipos ──────────────────────────────────────────────────────────────────────
type CalEvent = {
  id: string; title: string; time: string; endTime: string
  loc: string; color: string; date: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function toISO(d: Date) { return d.toISOString().slice(0, 10) }

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function formatTime(t: string) { return t.slice(0, 5) }

function ptWeekday(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

function ptMonthName(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long' })
}

function getWeekDays(anchor: Date): Date[] {
  const dow = anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d
  })
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const startDow = (first.getDay() + 6) % 7
  const result: (Date | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= last.getDate(); d++) result.push(new Date(year, month, d))
  while (result.length % 7 !== 0) result.push(null)
  return result
}

function isToday(d: Date) { return toISO(d) === toISO(new Date()) }

function dtoToCalEvent(e: EventDTO): CalEvent {
  const year = 2026
  const month = e.dayNum >= 26 ? 4 : 5
  const date = new Date(year, month, e.dayNum)
  return {
    id: e.id, title: e.titulo,
    time: formatTime(e.time), endTime: addMinutes(formatTime(e.time), 60),
    loc: e.loc ?? '', color: e.color, date: toISO(date),
  }
}

// ─── Estilos reutilizáveis ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--tx-2)', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  display: 'block', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)',
  borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
}

// ─── Modal de evento ────────────────────────────────────────────────────────────
function EventModal({
  event, defaultDate, defaultTime, onSave, onDelete, onClose,
}: {
  event: CalEvent | null; defaultDate: string; defaultTime: string
  onSave: (ev: CalEvent) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const isNew = !event
  const [title,   setTitle]   = useState(event?.title   ?? '')
  const [time,    setTime]    = useState(event?.time    ?? defaultTime)
  const [endTime, setEndTime] = useState(event?.endTime ?? addMinutes(defaultTime, 60))
  const [loc,     setLoc]     = useState(event?.loc     ?? '')
  const [color,   setColor]   = useState(event?.color   ?? '#6366F1')
  const [date,    setDate]    = useState(event?.date    ?? defaultDate)
  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => { titleRef.current?.focus() }, [])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ id: event?.id ?? `ev${Date.now()}`, title: title.trim(), time, endTime, loc, color, date })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 480, background: 'var(--bg-surface)', borderRadius: 18,
        border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)', padding: 28,
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{isNew ? 'Novo evento' : 'Editar evento'}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Ex: Reunião com orientador"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Início</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Fim</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Local / link</label>
            <input value={loc} onChange={e => setLoc(e.target.value)}
              placeholder="Ex: Sala B-204 ou meet.google.com/abc"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
            />
          </div>

          <div>
            <label style={labelStyle}>Cor</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EVENT_COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)} title={c.label}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: color === c.value ? '3px solid var(--tx-1)' : '3px solid transparent',
                    background: c.value, cursor: 'pointer', outline: 'none', padding: 0,
                    boxShadow: color === c.value ? `0 0 0 2px ${c.value}55` : 'none',
                    transition: 'all 150ms',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <div>
            {!isNew && (
              <button className="btn btn-secondary"
                style={{ color: 'var(--c-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => { onDelete(event!.id); onClose() }}>
                <Icon name="trash" size={14} /> Excluir
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>
              {isNew ? <><Icon name="plus" size={14} /> Criar evento</> : <><Icon name="check" size={14} /> Salvar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Linha "agora" ──────────────────────────────────────────────────────────────
function NowLine() {
  const [pos, setPos] = useState(() => {
    const now = new Date()
    return ((now.getHours() + now.getMinutes() / 60 - DAY_START) / TOTAL_HOURS) * 100
  })
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      setPos(((now.getHours() + now.getMinutes() / 60 - DAY_START) / TOTAL_HOURS) * 100)
    }, 60_000)
    return () => clearInterval(id)
  }, [])
  if (pos < 0 || pos > 100) return null
  return (
    <div style={{ position: 'absolute', top: `${pos}%`, left: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}>
      <div style={{ height: 2, background: 'var(--c-danger)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-danger)', position: 'absolute', left: -4, top: -3 }} />
      </div>
    </div>
  )
}

// ─── Bloco de evento na grade ───────────────────────────────────────────────────
function EventBlock({ ev, onClick }: { ev: CalEvent; onClick: (e: React.MouseEvent) => void }) {
  const start     = parseTime(ev.time)
  const end       = parseTime(ev.endTime)
  const topPct    = ((start - DAY_START) / TOTAL_HOURS) * 100
  const heightPct = Math.max(((end - start) / TOTAL_HOURS) * 100, 100 / TOTAL_HOURS / 2)
  const durMin    = Math.round((end - start) * 60)
  return (
    <div onClick={onClick} style={{
      position: 'absolute',
      top: `${topPct}%`, left: 4, right: 4, height: `${heightPct}%`,
      background: `${ev.color}22`, borderLeft: `3px solid ${ev.color}`,
      borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
      overflow: 'hidden', transition: 'filter 120ms', zIndex: 2,
    }}
      onMouseOver={e => (e.currentTarget.style.filter = 'brightness(1.3)')}
      onMouseOut={e => (e.currentTarget.style.filter = 'none')}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: ev.color, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {ev.title}
      </div>
      {durMin >= 45 && (
        <div style={{ fontSize: 11, color: 'var(--tx-2)', marginTop: 2 }}>
          {formatTime(ev.time)}–{formatTime(ev.endTime)}{ev.loc ? ` · ${ev.loc}` : ''}
        </div>
      )}
    </div>
  )
}

function DayColumn({ date, events, onSlotClick, onEventClick, isCurrentDay }: {
  date: Date; events: CalEvent[]
  onSlotClick: (date: string, time: string) => void
  onEventClick: (ev: CalEvent) => void
  isCurrentDay: boolean
}) {
  const dateStr = toISO(date)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientY - rect.top) / rect.height
    const hour = Math.floor(DAY_START + frac * TOTAL_HOURS)
    const min  = Math.floor(((DAY_START + frac * TOTAL_HOURS) - hour) * 60 / 15) * 15
    onSlotClick(dateStr, `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`)
  }
  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', borderRight: '1px solid var(--bd-default)', height: '100%', cursor: 'crosshair' }}
      onClick={handleClick}>
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${(i / TOTAL_HOURS) * 100}%`,
          left: 0, right: 0, height: 1,
          background: i === 0 ? 'transparent' : 'var(--bd-default)', pointerEvents: 'none',
        }} />
      ))}
      {isCurrentDay && <NowLine />}
      {events.map(ev => (
        <EventBlock key={ev.id} ev={ev} onClick={e => { e.stopPropagation(); onEventClick(ev) }} />
      ))}
    </div>
  )
}

function WeekView({ weekDays, events, onSlotClick, onEventClick, onDayClick }: {
  weekDays: Date[]; events: CalEvent[]
  onSlotClick: (date: string, time: string) => void
  onEventClick: (ev: CalEvent) => void
  onDayClick: (d: Date) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = HOUR_HEIGHT * 1 }, [])
  const timeLabels = Array.from({ length: TOTAL_HOURS }, (_, i) => `${String(DAY_START + i).padStart(2,'0')}:00`)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div />
        {weekDays.map(day => {
          const today = isToday(day)
          return (
            <div key={toISO(day)} onClick={() => onDayClick(day)}
              style={{ textAlign: 'center', padding: '10px 4px', borderLeft: '1px solid var(--bd-default)', cursor: 'pointer' }}>
              <div style={{ fontSize: 10, color: 'var(--tx-3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{ptWeekday(day)}</div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 auto', background: today ? 'var(--c-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: today ? 'white' : 'var(--tx-1)' }}>{day.getDate()}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div ref={scrollRef} className="scroll" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)', height: HOUR_HEIGHT * TOTAL_HOURS }}>
          <div style={{ position: 'relative', borderRight: '1px solid var(--bd-default)' }}>
            {timeLabels.map((t, i) => (
              <div key={t} style={{ position: 'absolute', top: `${(i / TOTAL_HOURS) * 100}%`, right: 8, fontSize: 10, color: 'var(--tx-3)', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
                {i > 0 ? t : ''}
              </div>
            ))}
          </div>
          {weekDays.map(day => (
            <DayColumn key={toISO(day)} date={day} events={events.filter(e => e.date === toISO(day))}
              onSlotClick={onSlotClick} onEventClick={onEventClick} isCurrentDay={isToday(day)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DayView({ date, events, onSlotClick, onEventClick }: {
  date: Date; events: CalEvent[]
  onSlotClick: (date: string, time: string) => void
  onEventClick: (ev: CalEvent) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = HOUR_HEIGHT * 1 }, [])
  const timeLabels = Array.from({ length: TOTAL_HOURS }, (_, i) => `${String(DAY_START + i).padStart(2,'0')}:00`)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-surface)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>
          {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        {isToday(date) && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--c-primary)', color: 'white', fontWeight: 600 }}>Hoje</span>}
      </div>
      <div ref={scrollRef} className="scroll" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', height: HOUR_HEIGHT * TOTAL_HOURS }}>
          <div style={{ position: 'relative', borderRight: '1px solid var(--bd-default)' }}>
            {timeLabels.map((t, i) => (
              <div key={t} style={{ position: 'absolute', top: `${(i / TOTAL_HOURS) * 100}%`, right: 8, fontSize: 10, color: 'var(--tx-3)', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
                {i > 0 ? t : ''}
              </div>
            ))}
          </div>
          <DayColumn date={date} events={events.filter(e => e.date === toISO(date))}
            onSlotClick={onSlotClick} onEventClick={onEventClick} isCurrentDay={isToday(date)} />
        </div>
      </div>
    </div>
  )
}

function MonthView({ year, month, events, selectedDate, onDayClick }: {
  year: number; month: number; events: CalEvent[]
  selectedDate: Date; onDayClick: (d: Date) => void
}) {
  const days = getMonthDays(year, month)
  const weekLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  return (
    <div style={{ flex: 1, overflow: 'auto' }} className="scroll">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        {weekLabels.map(l => (
          <div key={l} style={{ textAlign: 'center', padding: '10px 4px', fontSize: 11, fontWeight: 600, color: 'var(--tx-3)', textTransform: 'uppercase' }}>{l}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridAutoRows: 120 }}>
        {days.map((day, i) => {
          if (!day) return <div key={i} style={{ borderRight: '1px solid var(--bd-default)', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-base)', opacity: 0.3 }} />
          const dateStr  = toISO(day)
          const dayEvs   = events.filter(e => e.date === dateStr)
          const today    = isToday(day)
          const selected = toISO(selectedDate) === dateStr
          return (
            <div key={dateStr} onClick={() => onDayClick(day)}
              style={{ borderRight: '1px solid var(--bd-default)', borderBottom: '1px solid var(--bd-default)', padding: '6px 8px', cursor: 'pointer', transition: 'background 120ms', background: selected ? 'var(--c-primary-soft)' : 'transparent' }}
              onMouseOver={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)' }}
              onMouseOut={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: '50%', marginBottom: 4, alignItems: 'center', justifyContent: 'center', background: today ? 'var(--c-primary)' : 'transparent', color: today ? 'white' : 'var(--tx-1)', fontSize: 13, fontWeight: today ? 700 : 400 }}>
                {day.getDate()}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                {dayEvs.slice(0, 3).map(ev => (
                  <div key={ev.id} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: `${ev.color}22`, color: ev.color, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatTime(ev.time)} {ev.title}
                  </div>
                ))}
                {dayEvs.length > 3 && <div style={{ fontSize: 10, color: 'var(--tx-3)', paddingLeft: 6 }}>+{dayEvs.length - 3} mais</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayPanel({ date, events, onAdd, onEventClick }: {
  date: Date; events: CalEvent[]
  onAdd: () => void; onEventClick: (ev: CalEvent) => void
}) {
  const dayEvs = events.filter(e => e.date === toISO(date)).sort((a, b) => a.time.localeCompare(b.time))
  const totalOccupied = dayEvs.reduce((acc, ev) => acc + Math.max(parseTime(ev.endTime) - parseTime(ev.time), 0), 0)
  return (
    <aside style={{ width: 270, flexShrink: 0, borderLeft: '1px solid var(--bd-default)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--bd-default)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>{date.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
          <button className="btn btn-sm btn-primary" onClick={onAdd}><Icon name="plus" size={12} /> Evento</button>
        </div>
        <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>{date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '10px 10px' }}>
        {dayEvs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--tx-3)', fontSize: 13 }}>
            <Icon name="calendar-off" size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
            Nenhum evento<br />
            <button style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--c-primary)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }} onClick={onAdd}>+ Adicionar evento</button>
          </div>
        ) : dayEvs.map(ev => (
          <div key={ev.id} onClick={() => onEventClick(ev)}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 8px', borderRadius: 8, cursor: 'pointer', transition: 'background 120ms', marginBottom: 3 }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: ev.color, flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: 'var(--tx-2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="clock" size={10} />{formatTime(ev.time)} – {formatTime(ev.endTime)}{ev.loc ? ` · ${ev.loc}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--bd-default)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--tx-3)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Distribuição</div>
        {dayEvs.length > 0 ? (
          <div style={{ display: 'flex', height: 5, borderRadius: 99, overflow: 'hidden', gap: 2 }}>
            {dayEvs.map(ev => <div key={ev.id} style={{ flex: Math.max(parseTime(ev.endTime) - parseTime(ev.time), 0.25), background: ev.color, minWidth: 4 }} />)}
          </div>
        ) : <div style={{ height: 5, borderRadius: 99, background: 'var(--bd-default)' }} />}
        <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 6 }}>{dayEvs.length} evento{dayEvs.length !== 1 ? 's' : ''} · {totalOccupied.toFixed(1)}h ocupadas</div>
      </div>
    </aside>
  )
}

export function Agenda() {
  const { user } = useApp()
  const [view,        setView]        = useState<'week' | 'day' | 'month'>('week')
  const [anchor,      setAnchor]      = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const [events,      setEvents]      = useState<CalEvent[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState<{ event: CalEvent | null; date: string; time: string } | null>(null)

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    eventsApi.list()
      .then(data => setEvents(data.map(dtoToCalEvent)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const navigate = useCallback((dir: -1 | 1) => {
    setAnchor(prev => {
      const d = new Date(prev)
      if (view === 'day')   d.setDate(d.getDate() + dir)
      if (view === 'week')  d.setDate(d.getDate() + dir * 7)
      if (view === 'month') d.setMonth(d.getMonth() + dir)
      return d
    })
  }, [view])

  const goToday    = () => { setAnchor(new Date()); setSelectedDay(new Date()) }
  const weekDays   = getWeekDays(anchor)
  const openNew    = (date: string, time: string) => setModal({ event: null, date, time })
  const openEdit   = (ev: CalEvent) => setModal({ event: ev, date: ev.date, time: ev.time })
  const closeModal = () => setModal(null)

  const handleSave = async (ev: CalEvent) => {
    const exists = events.find(e => e.id === ev.id)
    if (!exists) {
      try {
        const dayNum = new Date(ev.date).getDate()
        const created = await eventsApi.create({ time: ev.time, titulo: ev.title, loc: ev.loc, color: ev.color, dayNum })
        setEvents(prev => [...prev, { ...ev, id: created.id }])
      } catch { setEvents(prev => [...prev, ev]) }
    } else {
      try { await eventsApi.update(ev.id, { time: ev.time, titulo: ev.title, loc: ev.loc, color: ev.color, dayNum: new Date(ev.date).getDate() }) } catch {}
      setEvents(prev => prev.map(e => e.id === ev.id ? ev : e))
    }
  }

  const handleDelete = async (id: string) => {
    try { await eventsApi.remove(id) } catch {}
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const handleDayClick = (d: Date) => { setSelectedDay(d); setAnchor(d); setView('day') }

  const navLabel = () => {
    if (view === 'day')  return anchor.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (view === 'week') {
      const wd = getWeekDays(anchor); const [first, last] = [wd[0], wd[6]]
      if (first.getMonth() === last.getMonth()) return `${ptMonthName(first)} ${first.getFullYear()}`
      return `${ptMonthName(first)} – ${ptMonthName(last)} ${last.getFullYear()}`
    }
    return anchor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const panelDate = view === 'week' ? selectedDay : anchor

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Agenda</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8 }}>
            <button className="icon-btn" onClick={() => navigate(-1)}><Icon name="chevron-left" size={16} /></button>
            <button className="btn btn-ghost" onClick={goToday} style={{ fontSize: 12, fontWeight: 600, padding: '0 10px' }}>Hoje</button>
            <button className="icon-btn" onClick={() => navigate(1)}><Icon name="chevron-right" size={16} /></button>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize', minWidth: 180 }}>{navLabel()}</span>
          <div style={{ flex: 1 }} />
          <div style={{ width: 200, height: 34, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
            <Icon name="search" size={13} style={{ color: 'var(--tx-3)' }} />
            <span style={{ color: 'var(--tx-3)', fontSize: 12 }}>Buscar evento…</span>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['day', 'week', 'month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: view === v ? 'var(--bg-surface)' : 'transparent', color: view === v ? 'var(--tx-1)' : 'var(--tx-3)', transition: 'all 120ms', boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.25)' : 'none' }}>
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => openNew(toISO(view === 'day' ? anchor : selectedDay), '09:00')}>
            <Icon name="plus" size={14} /> Novo evento
          </button>
        </header>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-3)', gap: 10 }}>
              <Icon name="loader" size={24} style={{ opacity: 0.5 }} /> Carregando agenda...
            </div>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                {view === 'week' && <WeekView weekDays={weekDays} events={events} onSlotClick={openNew} onEventClick={openEdit} onDayClick={d => setSelectedDay(d)} />}
                {view === 'day'  && <DayView date={anchor} events={events} onSlotClick={openNew} onEventClick={openEdit} />}
                {view === 'month' && <MonthView year={anchor.getFullYear()} month={anchor.getMonth()} events={events} selectedDate={selectedDay} onDayClick={handleDayClick} />}
              </div>
              {view !== 'month' && <DayPanel date={panelDate} events={events} onAdd={() => openNew(toISO(panelDate), '09:00')} onEventClick={openEdit} />}
            </>
          )}
        </div>
      </div>
      {modal && <EventModal event={modal.event} defaultDate={modal.date} defaultTime={modal.time} onSave={handleSave} onDelete={handleDelete} onClose={closeModal} />}
    </div>
  )
}
