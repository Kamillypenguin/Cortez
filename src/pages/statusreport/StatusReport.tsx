import { useState, useEffect, useRef } from 'react'
import { Icon, Avatar, Badge } from '../../components/ui'
import { Sidebar } from '../../components/layout/Sidebar'
import { useApp } from '../../lib/context'
import {
  projetos as projetosApi,
  riscos as riscosApi,
  type ProjetoDTO,
  type TaskDTO,
  type DocumentDTO,
  type MembroTimeDTO,
  type AtividadeDTO,
  type RiscoDTO,
} from '../../services/api'

// ─── Helpers ────────────────────────────────────────────────────────────────────
function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  const m = Math.floor(d / 60000)
  if (m < 1)  return 'agora'
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const dd = Math.floor(h / 24)
  return dd === 1 ? 'ontem' : `${dd} dias`
}

function extIcon(name: string) {
  const e = name.split('.').pop()?.toLowerCase() ?? ''
  const m: Record<string, { icon: string; color: string }> = {
    docx: { icon: 'file-text',        color: '#3B82F6' },
    doc:  { icon: 'file-text',        color: '#3B82F6' },
    xlsx: { icon: 'file-spreadsheet', color: '#10B981' },
    pdf:  { icon: 'file-type-pdf',    color: '#EF4444' },
    png:  { icon: 'photo',            color: '#8B5CF6' },
    jpg:  { icon: 'photo',            color: '#8B5CF6' },
    pptx: { icon: 'presentation',     color: '#F59E0B' },
    txt:  { icon: 'file-text',        color: '#6B7280' },
  }
  return m[e] ?? { icon: 'file', color: '#6B7280' }
}

const MEMBER_COLORS = ['#6366F1','#10B981','#F59E0B','#EC4899','#3B82F6','#8B5CF6']
function memberColor(s: string) {
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return MEMBER_COLORS[Math.abs(h) % MEMBER_COLORS.length]
}

const SEV_CFG = {
  critico:  { label: 'Crítico',  tone: 'urgent'    as const, color: 'var(--c-danger)'  },
  atencao:  { label: 'Atenção',  tone: 'attention' as const, color: 'var(--c-warning)' },
  baixo:    { label: 'Baixo',    tone: 'neutral'   as const, color: 'var(--tx-3)'      },
}
const STATUS_TASK = {
  none:    { label: 'A fazer',      color: 'var(--tx-3)',      bg: 'var(--bg-card)' },
  partial: { label: 'Em andamento', color: 'var(--c-warning)', bg: 'rgba(245,158,11,0.1)' },
  done:    { label: 'Concluído',    color: 'var(--c-success)', bg: 'rgba(16,185,129,0.1)' },
}

// ─── Modal de risco ──────────────────────────────────────────────────────────
function RiscoModal({ risco, projetoId, onSave, onClose }: {
  risco?: RiscoDTO | null
  projetoId: string
  onSave: (r: RiscoDTO) => void
  onClose: () => void
}) {
  const [titulo,     setTitulo]     = useState(risco?.titulo ?? '')
  const [descricao,  setDescricao]  = useState(risco?.descricao ?? '')
  const [severidade, setSeveridade] = useState<string>(risco?.severidade ?? 'atencao')
  const [impacto,    setImpacto]    = useState(risco?.impacto ?? '')
  const [status,     setStatus]     = useState(risco?.status ?? 'aberto')
  const [saving,     setSaving]     = useState(false)

  const submit = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      const payload = { titulo: titulo.trim(), descricao: descricao || undefined, severidade, impacto: impacto || undefined, status }
      let saved: RiscoDTO
      if (risco) {
        saved = await riscosApi.update(risco.id, payload)
      } else {
        saved = await riscosApi.create({ ...payload, projetoId })
      }
      onSave(saved)
    } catch { /* silencioso */ } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: 500, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{risco ? 'Editar risco' : 'Novo risco / impedimento'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)' }}>Título *</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Dependência sem owner"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)' }}>Severidade</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['critico','atencao','baixo'] as const).map(s => (
                <button key={s} onClick={() => setSeveridade(s)} style={{
                  flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: `1.5px solid ${severidade === s ? SEV_CFG[s].color : 'var(--bd-default)'}`,
                  background: severidade === s ? `${SEV_CFG[s].color}18` : 'var(--bg-card)',
                  color: severidade === s ? SEV_CFG[s].color : 'var(--tx-2)',
                }}>
                  {SEV_CFG[s].label}
                </button>
              ))}
            </div>
          </div>
          {risco && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--tx-1)', outline: 'none' }}>
                <option value="aberto">Aberto</option>
                <option value="mitigado">Mitigado</option>
                <option value="resolvido">Resolvido</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)' }}>Impacto</label>
          <input value={impacto} onChange={e => setImpacto(e.target.value)} placeholder="Ex: Bloqueia entrega em 2 semanas"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)' }}>Descrição</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} placeholder="Contexto adicional..."
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={!titulo.trim() || saving}>
            {saving ? 'Salvando…' : (risco ? 'Salvar alterações' : 'Criar risco')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
type ProjetoDetail = ProjetoDTO & {
  tarefas: TaskDTO[]
  documentos: DocumentDTO[]
  membros: MembroTimeDTO[]
  atividades: AtividadeDTO[]
}

export function StatusReport() {
  const { user, setPage } = useApp()
  const [projetos,    setProjetos]    = useState<ProjetoDTO[]>([])
  const [projetoId,   setProjetoId]   = useState<string | null>(null)
  const [detail,      setDetail]      = useState<ProjetoDetail | null>(null)
  const [riscosList,  setRiscosList]  = useState<RiscoDTO[]>([])
  const [tab,         setTab]         = useState<'overview' | 'tarefas' | 'arquivos' | 'riscos' | 'atividade'>('overview')
  const [riscoModal,  setRiscoModal]  = useState<{ open: boolean; risco?: RiscoDTO | null }>({ open: false })
  const [loading,     setLoading]     = useState(false)
  const [filterStatus,setFilterStatus]= useState<string>('all')

  const userId = user?.id

  // Carrega lista de projetos
  useEffect(() => {
    if (!userId) return
    projetosApi.list().then(list => {
      setProjetos(list)
      if (list.length > 0) setProjetoId(list[0].id)
    }).catch(console.error)
  }, [userId])

  // Carrega detalhes do projeto selecionado
  useEffect(() => {
    if (!projetoId) return
    setLoading(true)
    Promise.all([
      projetosApi.get(projetoId) as Promise<ProjetoDetail>,
      riscosApi.list(projetoId),
    ]).then(([d, r]) => {
      setDetail(d)
      setRiscosList(r)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [projetoId])

  // ── Métricas computadas ──────────────────────────────────────────────────────
  const tarefas    = detail?.tarefas ?? []
  const total      = tarefas.length
  const done       = tarefas.filter(t => t.status === 'done').length
  const partial    = tarefas.filter(t => t.status === 'partial').length
  const none       = tarefas.filter(t => t.status === 'none').length
  const pctDone    = total > 0 ? Math.round((done / total) * 100) : 0
  const today      = new Date().toISOString().slice(0, 10)
  const atrasadas  = tarefas.filter(t => t.status !== 'done' && t.due && t.due < today).length
  const riscosAbertos = riscosList.filter(r => r.status === 'aberto').length
  const riscosCriticos = riscosList.filter(r => r.status === 'aberto' && r.severidade === 'critico').length

  const prazoStatus = atrasadas > 0 ? 'Em risco' : riscosCriticos > 0 ? 'Atenção' : 'No prazo'
  const prazoColor  = atrasadas > 0 ? 'var(--c-danger)' : riscosCriticos > 0 ? 'var(--c-warning)' : 'var(--c-success)'

  // Tarefa filtrada
  const tarefasFiltradas = tarefas.filter(t => filterStatus === 'all' || t.status === filterStatus)

  // ── Handlers de risco ────────────────────────────────────────────────────────
  const onRiscoSaved = (r: RiscoDTO) => {
    setRiscosList(prev => {
      const idx = prev.findIndex(x => x.id === r.id)
      return idx >= 0 ? prev.map(x => x.id === r.id ? r : x) : [r, ...prev]
    })
    setRiscoModal({ open: false })
  }

  const deleteRisco = async (id: string) => {
    if (!confirm('Excluir este risco?')) return
    await riscosApi.remove(id)
    setRiscosList(prev => prev.filter(r => r.id !== id))
  }

  const toggleRiscoStatus = async (r: RiscoDTO) => {
    const next = r.status === 'aberto' ? 'mitigado' : r.status === 'mitigado' ? 'resolvido' : 'aberto'
    const updated = await riscosApi.update(r.id, { status: next })
    setRiscosList(prev => prev.map(x => x.id === r.id ? updated : x))
  }

  const projeto = projetos.find(p => p.id === projetoId)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Topbar ── */}
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <Icon name="chart-bar" size={18} style={{ color: 'var(--c-primary)' }} />
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Status Report</h1>

          {/* Seletor de projeto */}
          {projetos.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Icon name="chevron-right" size={13} style={{ color: 'var(--tx-3)' }} />
              <select value={projetoId ?? ''} onChange={e => { setProjetoId(e.target.value); setTab('overview') }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '5px 10px', fontSize: 13, fontWeight: 600, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
                {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Membros */}
          <div style={{ display: 'flex' }}>
            {(detail?.membros ?? []).slice(0, 5).map((m, i) => (
              <div key={m.id} title={m.nome ?? m.email} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Avatar name={m.nome ?? m.email} size={28} color={memberColor(m.email)} />
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Icon name="printer" size={14} /> Exportar
          </button>
        </header>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-surface)', padding: '0 24px', flexShrink: 0 }}>
          {([
            { id: 'overview',  label: 'Visão Geral',   icon: 'layout-dashboard' },
            { id: 'tarefas',   label: 'Tarefas',        icon: 'checklist' },
            { id: 'arquivos',  label: 'Arquivos',        icon: 'files' },
            { id: 'riscos',    label: 'Riscos',          icon: 'alert-triangle', badge: riscosAbertos > 0 ? riscosAbertos : null },
            { id: 'atividade', label: 'Atividade',       icon: 'activity' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 6,
              color: tab === t.id ? 'var(--tx-1)' : 'var(--tx-3)',
              fontWeight: tab === t.id ? 600 : 500, fontSize: 13,
              borderBottom: `2px solid ${tab === t.id ? 'var(--c-primary)' : 'transparent'}`,
              marginBottom: -1, transition: 'color 120ms',
            }}>
              <Icon name={t.icon} size={14} />
              {t.label}
              {t.badge && (
                <span style={{ background: 'var(--c-danger)', color: 'white', borderRadius: 99, fontSize: 10, padding: '1px 5px', fontWeight: 700 }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Conteúdo ── */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 24px 32px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)' }}>
              <Icon name="loader" size={28} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.5 }} />
              Carregando dados do projeto…
            </div>
          )}

          {!loading && !detail && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)', fontSize: 14 }}>
              <Icon name="folder" size={40} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.3 }} />
              Nenhum projeto selecionado.<br />Crie um projeto na barra lateral para começar.
            </div>
          )}

          {!loading && detail && (
            <>
              {/* ═══════════════ OVERVIEW ═══════════════ */}
              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Cabeçalho do projeto */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--bd-default)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${projeto?.cor ?? '#6366F1'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="folder" size={24} style={{ color: projeto?.cor ?? '#6366F1' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{detail.nome}</h2>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${projeto?.cor ?? '#6366F1'}22`, color: projeto?.cor ?? '#6366F1', fontWeight: 600, border: `1px solid ${projeto?.cor ?? '#6366F1'}44` }}>
                          {detail.status}
                        </span>
                      </div>
                      {detail.descricao && <p style={{ margin: 0, fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.5 }}>{detail.descricao}</p>}
                      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--tx-3)' }}>
                        <span><Icon name="users" size={12} style={{ marginRight: 4 }} />{detail.membros.length} membros</span>
                        <span><Icon name="checklist" size={12} style={{ marginRight: 4 }} />{total} tarefas</span>
                        <span><Icon name="files" size={12} style={{ marginRight: 4 }} />{detail.documentos.length} arquivos</span>
                        <span><Icon name="alert-triangle" size={12} style={{ marginRight: 4 }} />{riscosAbertos} riscos abertos</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => setTab('tarefas')}><Icon name="checklist" size={13} /> Tarefas</button>
                      <button className="btn btn-primary" onClick={() => setTab('riscos')}><Icon name="alert-triangle" size={13} /> Riscos</button>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Conclusão geral', value: `${pctDone}%`, sub: `${done} de ${total} tarefas`, color: pctDone >= 75 ? 'var(--c-success)' : pctDone >= 40 ? 'var(--c-warning)' : 'var(--c-danger)', icon: 'chart-pie' },
                      { label: 'Em andamento', value: String(partial), sub: `${none} a fazer`, color: 'var(--c-primary)', icon: 'loader' },
                      { label: 'Prazo', value: prazoStatus, sub: atrasadas > 0 ? `${atrasadas} atrasada${atrasadas > 1 ? 's' : ''}` : 'Sem atrasos', color: prazoColor, icon: 'calendar-due' },
                      { label: 'Riscos abertos', value: String(riscosAbertos), sub: riscosCriticos > 0 ? `${riscosCriticos} crítico${riscosCriticos > 1 ? 's' : ''}` : 'Sem críticos', color: riscosAbertos > 0 ? 'var(--c-danger)' : 'var(--c-success)', icon: 'flame' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)' }}>{m.label}</span>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: `${m.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={m.icon} size={14} style={{ color: m.color }} />
                          </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: m.color, lineHeight: 1 }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 6 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Barra de progresso geral */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Progresso por status</span>
                      <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{total} tarefas no total</span>
                    </div>
                    {total > 0 ? (
                      <>
                        <div style={{ height: 10, borderRadius: 99, background: 'var(--bg-base)', overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${pctDone}%`, background: 'var(--c-success)', transition: 'width 600ms ease' }} />
                          <div style={{ width: `${total > 0 ? (partial / total * 100) : 0}%`, background: 'var(--c-warning)', transition: 'width 600ms ease' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
                          {[
                            { label: 'Concluído', count: done, color: 'var(--c-success)' },
                            { label: 'Em andamento', count: partial, color: 'var(--c-warning)' },
                            { label: 'A fazer', count: none, color: 'var(--tx-3)' },
                          ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--tx-2)' }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                              {s.label} <strong style={{ color: s.color }}>{s.count}</strong>
                            </div>
                          ))}
                          {atrasadas > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-danger)' }}>
                              <Icon name="clock" size={12} />
                              <strong>{atrasadas}</strong> atrasada{atrasadas > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--tx-3)' }}>Nenhuma tarefa neste projeto ainda.</p>
                    )}
                  </div>

                  {/* 2 colunas: últimas tarefas + últimos arquivos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                    {/* Tarefas recentes */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Tarefas recentes</span>
                        <button className="btn btn-sm btn-ghost" onClick={() => setTab('tarefas')}>Ver todas</button>
                      </div>
                      {tarefas.length === 0 ? (
                        <div style={{ padding: '20px 16px', fontSize: 12, color: 'var(--tx-3)', textAlign: 'center' }}>Nenhuma tarefa</div>
                      ) : (
                        tarefas.slice(0, 5).map((t, i) => {
                          const s = STATUS_TASK[t.status as keyof typeof STATUS_TASK] ?? STATUS_TASK.none
                          return (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < 4 ? '1px solid var(--bd-default)' : 'none' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.5 : 1 }}>{t.titulo}</span>
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600, flexShrink: 0 }}>{s.label}</span>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Arquivos do projeto */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Documentos do projeto</span>
                        <button className="btn btn-sm btn-ghost" onClick={() => setTab('arquivos')}>Ver todos</button>
                      </div>
                      {detail.documentos.length === 0 ? (
                        <div style={{ padding: '20px 16px', fontSize: 12, color: 'var(--tx-3)', textAlign: 'center' }}>Nenhum arquivo vinculado</div>
                      ) : (
                        detail.documentos.slice(0, 5).map((d, i) => {
                          const fi = extIcon(d.nome)
                          return (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: i < 4 ? '1px solid var(--bd-default)' : 'none' }}>
                              <Icon name={fi.icon} size={16} style={{ color: fi.color, flexShrink: 0 }} />
                              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nome}</span>
                              <span style={{ fontSize: 11, color: 'var(--tx-3)', flexShrink: 0 }}>{relTime(d.updatedAt)}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Riscos ativos em destaque */}
                  {riscosList.filter(r => r.status === 'aberto').length > 0 && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon name="alert-triangle" size={15} style={{ color: 'var(--c-danger)' }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Riscos abertos</span>
                          <span style={{ fontSize: 11, background: 'var(--c-danger)', color: 'white', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>{riscosList.filter(r => r.status === 'aberto').length}</span>
                        </div>
                        <button className="btn btn-sm btn-ghost" onClick={() => setTab('riscos')}>Gerenciar</button>
                      </div>
                      {riscosList.filter(r => r.status === 'aberto').slice(0, 3).map((r, i, arr) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--bd-default)' : 'none' }}>
                          <div style={{ width: 3, alignSelf: 'stretch', background: SEV_CFG[r.severidade]?.color ?? 'var(--tx-3)', borderRadius: 2 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <Badge tone={SEV_CFG[r.severidade]?.tone ?? 'neutral'}>{SEV_CFG[r.severidade]?.label}</Badge>
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{r.titulo}</span>
                            </div>
                            {r.impacto && <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>{r.impacto}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Atividade recente */}
                  {detail.atividades.length > 0 && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--bd-default)' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Atividade recente</span>
                      </div>
                      <div style={{ padding: '8px 16px' }}>
                        {detail.atividades.slice(0, 4).map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--bd-default)' }}>
                            <Avatar name={a.nomeUsuario} size={26} color={memberColor(a.usuarioId)} />
                            <div style={{ flex: 1, fontSize: 13 }}>
                              <strong>{a.nomeUsuario}</strong>
                              <span style={{ color: 'var(--tx-2)' }}> {a.descricao}</span>
                              {a.alvo && <span style={{ color: 'var(--c-primary)' }}> {a.alvo}</span>}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--tx-3)', flexShrink: 0 }}>{relTime(a.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════ TAREFAS ═══════════════ */}
              {tab === 'tarefas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Filtros */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {(['all','none','partial','done'] as const).map(s => {
                      const labels = { all: 'Todas', none: 'A fazer', partial: 'Em andamento', done: 'Concluídas' }
                      const counts = {
                        all: tarefas.length,
                        none: tarefas.filter(t => t.status === 'none').length,
                        partial: tarefas.filter(t => t.status === 'partial').length,
                        done: tarefas.filter(t => t.status === 'done').length,
                      }
                      return (
                        <button key={s} onClick={() => setFilterStatus(s)} style={{
                          padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          border: `1.5px solid ${filterStatus === s ? 'var(--c-primary)' : 'var(--bd-default)'}`,
                          background: filterStatus === s ? 'var(--c-primary-soft)' : 'var(--bg-card)',
                          color: filterStatus === s ? 'var(--c-primary)' : 'var(--tx-2)',
                        }}>
                          {labels[s]} <span style={{ opacity: 0.6 }}>({counts[s]})</span>
                        </button>
                      )
                    })}
                    {atrasadas > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--c-danger)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                        <Icon name="clock" size={12} /> {atrasadas} atrasada{atrasadas > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {tarefasFiltradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--tx-3)', fontSize: 13 }}>Nenhuma tarefa neste filtro</div>
                  ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 90px', padding: '9px 16px', borderBottom: '1px solid var(--bd-default)', fontSize: 11, fontWeight: 600, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span>Tarefa</span><span>Prazo</span><span>Status</span><span>Prioridade</span>
                      </div>
                      {tarefasFiltradas.map((t, i) => {
                        const s = STATUS_TASK[t.status as keyof typeof STATUS_TASK] ?? STATUS_TASK.none
                        const isLate = t.status !== 'done' && t.due && t.due < today
                        const prioColor = t.prioridade === 'urgent' ? 'var(--c-danger)' : t.prioridade === 'attention' ? 'var(--c-warning)' : 'var(--tx-3)'
                        return (
                          <div key={t.id} style={{
                            display: 'grid', gridTemplateColumns: '2fr 100px 120px 90px',
                            padding: '12px 16px', alignItems: 'center',
                            borderBottom: i < tarefasFiltradas.length - 1 ? '1px solid var(--bd-default)' : 'none',
                            background: isLate ? 'rgba(239,68,68,0.03)' : 'transparent',
                            cursor: 'default',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 3, height: 32, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.5 : 1 }}>{t.titulo}</div>
                                {t.descricao && <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descricao}</div>}
                              </div>
                            </div>
                            <span style={{ fontSize: 12, color: isLate ? 'var(--c-danger)' : 'var(--tx-2)', fontWeight: isLate ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {isLate && <Icon name="clock" size={11} />}{t.due}
                            </span>
                            <div>
                              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                            </div>
                            <span style={{ fontSize: 11, color: prioColor, fontWeight: 600 }}>
                              {t.prioridade === 'urgent' ? '🔴 Urgente' : t.prioridade === 'attention' ? '🟡 Atenção' : '⚪ Normal'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════ ARQUIVOS ═══════════════ */}
              {tab === 'arquivos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--tx-2)' }}>
                    <strong>{detail.documentos.length}</strong> arquivo{detail.documentos.length !== 1 ? 's' : ''} vinculado{detail.documentos.length !== 1 ? 's' : ''} a este projeto
                  </div>

                  {detail.documentos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--tx-3)', fontSize: 13, border: '2px dashed var(--bd-default)', borderRadius: 12 }}>
                      <Icon name="files" size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                      Nenhum arquivo vinculado a este projeto.<br />
                      <span style={{ fontSize: 12 }}>Vá em "Arquivos" e vincule documentos a este projeto.</span>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 80px', padding: '9px 16px', borderBottom: '1px solid var(--bd-default)', fontSize: 11, fontWeight: 600, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span>Arquivo</span><span>Tipo</span><span>Modificado</span><span>Acesso</span>
                      </div>
                      {detail.documentos.map((d, i) => {
                        const fi = extIcon(d.nome)
                        return (
                          <div key={d.id} style={{
                            display: 'grid', gridTemplateColumns: '1fr 80px 100px 80px',
                            padding: '11px 16px', alignItems: 'center',
                            borderBottom: i < detail.documentos.length - 1 ? '1px solid var(--bd-default)' : 'none',
                            cursor: 'pointer', transition: 'background 120ms',
                          }}
                            onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)' }}
                            onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${fi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name={fi.icon} size={16} style={{ color: fi.color }} />
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.nome}</div>
                                {d.tamanho && <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{d.tamanho}</div>}
                              </div>
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--tx-2)', textTransform: 'uppercase' }}>.{d.tipo}</span>
                            <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>{relTime(d.updatedAt)}</span>
                            <span style={{ fontSize: 11, color: d.compartilhado ? 'var(--c-success)' : 'var(--tx-3)' }}>
                              {d.compartilhado ? 'Compartilhado' : 'Privado'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════ RISCOS ═══════════════ */}
              {tab === 'riscos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Riscos e Impedimentos</div>
                      <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 2 }}>
                        {riscosAbertos} aberto{riscosAbertos !== 1 ? 's' : ''} · {riscosCriticos} crítico{riscosCriticos !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setRiscoModal({ open: true, risco: null })}>
                      <Icon name="plus" size={14} /> Novo risco
                    </button>
                  </div>

                  {/* Por severidade */}
                  {(['critico','atencao','baixo'] as const).map(sev => {
                    const group = riscosList.filter(r => r.severidade === sev)
                    if (group.length === 0) return null
                    const cfg = SEV_CFG[sev]
                    return (
                      <div key={sev} style={{ background: 'var(--bg-card)', border: `1px solid ${cfg.color}33`, borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 8, background: `${cfg.color}08` }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: cfg.color }}>{cfg.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>({group.length})</span>
                        </div>
                        {group.map((r, i) => (
                          <div key={r.id} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '14px 16px',
                            borderBottom: i < group.length - 1 ? '1px solid var(--bd-default)' : 'none',
                            opacity: r.status === 'resolvido' ? 0.45 : 1,
                          }}>
                            <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: r.status === 'resolvido' ? 'var(--tx-3)' : cfg.color, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, textDecoration: r.status === 'resolvido' ? 'line-through' : 'none' }}>{r.titulo}</span>
                                <span style={{
                                  fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                                  background: r.status === 'resolvido' ? 'rgba(16,185,129,0.12)' : r.status === 'mitigado' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                                  color: r.status === 'resolvido' ? 'var(--c-success)' : r.status === 'mitigado' ? 'var(--c-warning)' : 'var(--c-danger)',
                                }}>
                                  {r.status === 'resolvido' ? 'Resolvido' : r.status === 'mitigado' ? 'Mitigado' : 'Aberto'}
                                </span>
                              </div>
                              {r.descricao && <div style={{ fontSize: 12, color: 'var(--tx-2)', marginBottom: 4 }}>{r.descricao}</div>}
                              {r.impacto && (
                                <div style={{ fontSize: 12, color: 'var(--tx-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Icon name="alert-circle" size={11} />Impacto: {r.impacto}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button className="btn btn-sm btn-secondary" onClick={() => toggleRiscoStatus(r)} title="Avançar status">
                                <Icon name="check" size={12} />
                              </button>
                              <button className="btn btn-sm btn-secondary" onClick={() => setRiscoModal({ open: true, risco: r })}>
                                <Icon name="pencil" size={12} />
                              </button>
                              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--c-danger)' }} onClick={() => deleteRisco(r.id)}>
                                <Icon name="trash" size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}

                  {riscosList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--tx-3)', fontSize: 13, border: '2px dashed var(--bd-default)', borderRadius: 12 }}>
                      <Icon name="shield-check" size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3, color: 'var(--c-success)' }} />
                      Nenhum risco cadastrado. Projeto em boa saúde!
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════ ATIVIDADE ═══════════════ */}
              {tab === 'atividade' && (
                <div style={{ maxWidth: 640 }}>
                  {detail.atividades.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--tx-3)', fontSize: 13 }}>
                      <Icon name="activity" size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                      Nenhuma atividade registrada neste projeto
                    </div>
                  ) : (
                    detail.atividades.map(a => (
                      <div key={a.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--bd-default)' }}>
                        <Avatar name={a.nomeUsuario} size={34} color={memberColor(a.usuarioId)} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                            <strong>{a.nomeUsuario}</strong>
                            <span style={{ color: 'var(--tx-2)' }}> {a.descricao}</span>
                            {a.alvo && <span style={{ color: 'var(--c-primary)' }}> {a.alvo}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, color: 'var(--tx-3)' }}>
                            <span>{relTime(a.createdAt)}</span>
                            <span>· {a.entidade}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de risco */}
      {riscoModal.open && projetoId && (
        <RiscoModal
          risco={riscoModal.risco}
          projetoId={projetoId}
          onSave={onRiscoSaved}
          onClose={() => setRiscoModal({ open: false })}
        />
      )}
    </div>
  )
}
