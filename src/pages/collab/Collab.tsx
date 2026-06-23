import { useState, useEffect, useRef } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon, Badge, Avatar } from '../../components/ui'
import {
  projetos as projetosApi,
  tasks as tasksApi,
  type ProjetoDTO,
  type TaskDTO,
  type MembroTimeDTO,
  type AtividadeDTO,
} from '../../services/api'
import { useApp } from '../../lib/context'

type TaskStatus = 'none' | 'partial' | 'done'

const STATUS_MAP = {
  none:    { label: 'A fazer',       tone: 'neutral'   as const },
  partial: { label: 'Em andamento',  tone: 'attention' as const },
  done:    { label: 'Concluído',     tone: 'normal'    as const },
}

const ONLINE_COLOR: Record<string, string> = {
  online: 'var(--c-success)',
  away:   'var(--c-warning)',
  offline:'var(--tx-3)',
}

const MEMBER_COLORS = ['#6366F1','#10B981','#F59E0B','#EC4899','#3B82F6','#8B5CF6','#EF4444','#14B8A6']
function memberColor(email: string) {
  let h = 0; for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return MEMBER_COLORS[Math.abs(h) % MEMBER_COLORS.length]
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)  return 'ontem'
  return `${d} dias atrás`
}

export function Collab() {
  const { user } = useApp()
  const [tab,      setTab]      = useState<'tarefas' | 'membros' | 'atividade'>('tarefas')
  const [projetos, setProjetos] = useState<ProjetoDTO[]>([])
  const [projetoId,setProjetoId]= useState<string | null>(null)
  const [membros,  setMembros]  = useState<MembroTimeDTO[]>([])
  const [tasks,    setTasks]    = useState<TaskDTO[]>([])
  const [ativs,    setAtivs]    = useState<AtividadeDTO[]>([])
  const [chatMsg,  setChatMsg]  = useState('')
  // Chat local (sem persistência ainda — usa Comentario como base futura)
  const [chatLines,setChatLines]= useState<{ user: string; color: string; text: string; time: string; me: boolean }[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const userId = user?.id

  // Carrega projetos
  useEffect(() => {
    if (!userId) return
    projetosApi.list().then(list => {
      setProjetos(list)
      if (list.length > 0) setProjetoId(list[0].id)
    }).catch(console.error)
  }, [userId])

  // Carrega dados do projeto selecionado
  useEffect(() => {
    if (!projetoId) return
    Promise.all([
      projetosApi.listMembros(projetoId),
      tasksApi.list(),
      projetosApi.listAtividades(projetoId),
    ]).then(([m, t, a]) => {
      setMembros(m)
      setTasks(t.filter(task => task.projetoId === projetoId))
      setAtivs(a)
    }).catch(console.error)
  }, [projetoId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLines])

  const sendChat = () => {
    const text = chatMsg.trim()
    if (!text) return
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    setChatLines(prev => [...prev, { user: user?.nome ?? 'Você', color: '#8B5CF6', text, time, me: true }])
    setChatMsg('')
  }

  const projeto = projetos.find(p => p.id === projetoId)
  const onlineCount = membros.filter(m => m.online).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--bd-default)' }}>
        {/* Topbar */}
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Colaboração</h1>
          {onlineCount > 0 && <Badge tone="neutral">{onlineCount} online</Badge>}

          {/* Seletor de projeto */}
          {projetos.length > 0 && (
            <select value={projetoId ?? ''} onChange={e => setProjetoId(e.target.value)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
              {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          )}

          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex' }}>
            {membros.slice(0, 4).map((m, i) => (
              <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, position: 'relative' }}>
                <Avatar name={m.nome ?? m.email} size={28} color={memberColor(m.email)} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: m.online ? ONLINE_COLOR.online : ONLINE_COLOR.offline, border: '1.5px solid var(--bg-surface)' }} />
              </div>
            ))}
            {membros.length > 4 && (
              <div style={{ marginLeft: -8, width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--tx-2)', fontWeight: 600 }}>
                +{membros.length - 4}
              </div>
            )}
          </div>
          <button className="btn btn-secondary"><Icon name="user-plus" size={14} /> Convidar</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Nova tarefa</button>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 28px', borderBottom: '1px solid var(--bd-default)', background: 'var(--bg-surface)', flexShrink: 0 }}>
          {(['tarefas', 'membros', 'atividade'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 14px',
              color: tab === t ? 'var(--tx-1)' : 'var(--tx-2)', fontWeight: tab === t ? 600 : 500,
              fontSize: 13, borderBottom: `2px solid ${tab === t ? 'var(--c-primary)' : 'transparent'}`,
              marginBottom: -1, textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }} className="scroll">

          {/* ── Tarefas ── */}
          {tab === 'tarefas' && (
            tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)', fontSize: 13 }}>
                <Icon name="checklist" size={36} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.4 }} />
                Nenhuma tarefa neste projeto
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 80px', padding: '8px 16px', borderBottom: '1px solid var(--bd-default)', fontSize: 11, color: 'var(--tx-3)', fontWeight: 600 }}>
                  <span>Tarefa</span><span>Responsáveis</span><span>Projeto</span><span>Prazo</span><span>Status</span>
                </div>
                {tasks.map((t, i) => {
                  const st = STATUS_MAP[t.status as TaskStatus] ?? STATUS_MAP.none
                  return (
                    <div key={t.id} style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 80px',
                      padding: '12px 16px', alignItems: 'center',
                      borderBottom: i < tasks.length - 1 ? '1px solid var(--bd-default)' : 'none',
                      cursor: 'pointer', transition: 'background 120ms', opacity: t.status === 'done' ? 0.5 : 1,
                    }}
                      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)' }}
                      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.titulo}</span>
                      <div style={{ display: 'flex' }}>
                        {(t.responsaveis ?? []).slice(0, 3).map((r, j) => (
                          <div key={r.email} style={{ marginLeft: j > 0 ? -6 : 0 }}>
                            <Avatar name={r.nome ?? r.email} size={22} color={memberColor(r.email)} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.projeto?.cor ?? t.projColor }} />
                        <span style={{ color: 'var(--tx-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.projeto?.nome ?? t.proj}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>{t.due}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* ── Membros ── */}
          {tab === 'membros' && (
            membros.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)', fontSize: 13 }}>
                <Icon name="users" size={36} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.4 }} />
                Nenhum membro neste projeto
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {membros.map(m => {
                  const color = memberColor(m.email)
                  const onlineStatus = m.online ? 'online' : 'offline'
                  return (
                    <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'border-color 120ms' }}
                      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = color }}
                      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bd-default)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ position: 'relative' }}>
                          <Avatar name={m.nome ?? m.email} size={40} color={color} />
                          <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: ONLINE_COLOR[onlineStatus], border: '2px solid var(--bg-card)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{m.nome ?? m.email}</div>
                          <div style={{ fontSize: 12, color: 'var(--tx-2)' }}>{m.papel}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--tx-2)' }}>
                        <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{m.email}</span>
                        <span style={{ color: ONLINE_COLOR[onlineStatus], fontWeight: 500 }}>{onlineStatus}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* ── Atividade ── */}
          {tab === 'atividade' && (
            ativs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)', fontSize: 13 }}>
                <Icon name="activity" size={36} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.4 }} />
                Nenhuma atividade registrada
              </div>
            ) : (
              <div style={{ maxWidth: 600 }}>
                {ativs.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--bd-default)' }}>
                    <Avatar name={a.nomeUsuario} size={32} color={memberColor(a.usuarioId)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>
                        <strong>{a.nomeUsuario}</strong>
                        <span style={{ color: 'var(--tx-2)' }}> {a.descricao} </span>
                        {a.alvo && <span style={{ color: 'var(--c-primary)' }}>{a.alvo}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 3 }}>{relativeTime(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Right — chat */}
      <aside style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--bd-default)' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Chat do grupo</h3>
          <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 2 }}>{projeto?.nome ?? 'Selecione um projeto'}</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }} className="scroll">
          {chatLines.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--tx-3)', fontSize: 12 }}>
              <Icon name="message" size={28} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
              Nenhuma mensagem ainda
            </div>
          )}
          {chatLines.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: msg.me ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              {!msg.me && <Avatar name={msg.user} size={24} color={msg.color} />}
              <div style={{
                maxWidth: '75%', padding: '8px 12px', borderRadius: msg.me ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.me ? 'var(--c-primary)' : 'var(--bg-card)', fontSize: 13, lineHeight: 1.4,
              }}>
                {!msg.me && <div style={{ fontSize: 11, fontWeight: 600, color: msg.color, marginBottom: 3 }}>{msg.user}</div>}
                <div>{msg.text}</div>
                <div style={{ fontSize: 10, color: msg.me ? 'rgba(255,255,255,0.6)' : 'var(--tx-3)', marginTop: 4, textAlign: 'right' }}>{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--bd-default)' }}>
          <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 10, padding: '8px 12px' }}>
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Mensagem…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--tx-1)' }}
            />
            <button onClick={sendChat} style={{ background: 'var(--c-primary)', border: 'none', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <Icon name="send" size={14} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
