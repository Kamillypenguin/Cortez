import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon, Sparkle, Badge, Avatar, CheckCircle } from '../../components/ui'
import type { CheckState } from '../../components/ui'
import { tasks as tasksApi, events as eventsApi, documents as docsApi, projetos as projetosApi, type DocumentDTO, type AtividadeDTO } from '../../services/api'
import { useApp } from '../../lib/context'

type Task = { id: string; title: string; proj: string; projColor: string; urgency: string; due: string; durMin: number; projId?: string }
type TaskStateMap = Record<string, CheckState>

type CalEvent = { id: string; time: string; title: string; loc: string; color: string }

const INITIAL_EVENTS: Record<number, CalEvent[]> = {
  26: [
    { id: 'e1', time: '11:00', title: 'Aula de Estatística', loc: 'Sala B-204', color: '#10B981' },
    { id: 'e2', time: '14:30', title: 'Reunião do grupo', loc: 'Discord', color: '#6366F1' },
    { id: 'e3', time: '18:00', title: 'Yoga', loc: 'Estúdio', color: '#F59E0B' },
  ],
  27: [
    { id: 'e4', time: '09:00', title: 'Orientação TCC', loc: 'Sala 412', color: '#6366F1' },
    { id: 'e5', time: '16:00', title: 'Revisão de Cálculo', loc: 'Biblioteca', color: '#EC4899' },
  ],
  28: [
    { id: 'e6', time: '10:00', title: 'Defesa de proposta IC', loc: 'Online', color: '#F59E0B' },
  ],
  29: [
    { id: 'e7', time: '08:00', title: 'Aula de Inglês', loc: 'Sala 201', color: '#3B82F6' },
    { id: 'e8', time: '13:00', title: 'Almoço com equipe', loc: 'Bandejão', color: '#10B981' },
    { id: 'e9', time: '19:00', title: 'Yoga', loc: 'Estúdio', color: '#F59E0B' },
    { id: 'e10', time: '21:00', title: 'Estudo para prova', loc: 'Casa', color: '#EC4899' },
  ],
  30: [],
  31: [
    { id: 'e11', time: '20:00', title: 'Confraternização', loc: 'Casa do Pedro', color: '#EC4899' },
  ],
  1: [
    { id: 'e12', time: '11:00', title: 'Aula de Estatística', loc: 'Sala B-204', color: '#10B981' },
    { id: 'e13', time: '15:00', title: 'Reunião IC', loc: 'Lab 3', color: '#F59E0B' },
  ],
}


// Maps a task's due string to a calendar day number (26..31, 1)
// Returns null if it falls outside the current week view
function dueToWeekDay(due: string): number | null {
  const s = due.toLowerCase()
  if (s.startsWith('hoje') || s.startsWith('terça')) return 26
  if (s.startsWith('amanhã') || s.startsWith('quarta')) return 27
  if (s.startsWith('quinta')) return 28
  if (s.startsWith('sexta')) return 29
  if (s.startsWith('sábado') || s.startsWith('sabado')) return 30
  if (s.startsWith('domingo')) return 31
  if (s.startsWith('segunda')) return 1
  // "3 jun", "5 jun" etc.
  const mMatch = s.match(/(\d+)\s*(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/)
  if (mMatch) {
    const monthMap: Record<string, number> = { jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11 }
    const dayNum = parseInt(mMatch[1])
    const month = monthMap[mMatch[2]]
    const now = new Date(2026, 4, 26)
    const target = new Date(2026, month, dayNum)
    const diff = Math.round((target.getTime() - now.getTime()) / 86400000)
    if (diff < 0 || diff > 6) return null
    // Map diff 0..6 → week day numbers 26,27,28,29,30,31,1
    const weekNums = [26, 27, 28, 29, 30, 31, 1]
    return weekNums[diff]
  }
  return null
}

// For "Prazos próximos": days remaining count
function parseDueDays(due: string): number | null {
  const s = due.toLowerCase()
  if (s.startsWith('hoje') || s.startsWith('terça')) return 0
  if (s.startsWith('amanhã') || s.startsWith('quarta')) return 1
  if (s.startsWith('quinta')) return 2
  if (s.startsWith('sexta')) return 3
  if (s.startsWith('sábado') || s.startsWith('sabado')) return 4
  if (s.startsWith('domingo')) return 5
  if (s.startsWith('segunda')) return 6
  const mMatch = s.match(/(\d+)\s*(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/)
  if (mMatch) {
    const monthMap: Record<string, number> = { jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11 }
    const dayNum = parseInt(mMatch[1])
    const month = monthMap[mMatch[2]]
    const now = new Date(2026, 4, 26)
    const target = new Date(2026, month, dayNum)
    const diff = Math.round((target.getTime() - now.getTime()) / 86400000)
    return Math.max(0, diff)
  }
  return null
}

function dayLabel(d: number) {
  if (d === 0) return 'Hoje'
  if (d === 1) return '1 dia'
  return `${d} dias`
}

function deadlineColor(days: number, state: CheckState): string {
  if (state === 'done') return '#10B981'
  if (state === 'partial') return '#F59E0B'
  if (days === 0) return '#EF4444'
  if (days <= 2) return '#F59E0B'
  if (days <= 7) return '#F59E0B'
  return '#10B981'
}


type RecentFile = {
  id: string; icon: string; name: string; proj: string; t: string; color: string
  size: string; type: 'docx' | 'xlsx' | 'png' | 'pdf' | 'pptx'
  sharedWith: string[]
}

const recentFiles: RecentFile[] = [
  { id: 'f1', icon: 'file-text', name: 'Cap3_revisao_2.docx', proj: 'TCC · Visão', t: 'há 12min', color: '#3B82F6', size: '248 KB', type: 'docx', sharedWith: ['prof.costa@univ.br'] },
  { id: 'f2', icon: 'file-spreadsheet', name: 'dataset_resultados.xlsx', proj: 'Iniciação Cient.', t: 'há 1h', color: '#10B981', size: '1.2 MB', type: 'xlsx', sharedWith: ['lucas.m@univ.br', 'prof.costa@univ.br'] },
  { id: 'f3', icon: 'photo', name: 'diagrama_arquitetura.png', proj: 'TCC · Visão', t: 'ontem', color: '#8B5CF6', size: '3.4 MB', type: 'png', sharedWith: [] },
  { id: 'f4', icon: 'file-text', name: 'lista_5_enunciado.pdf', proj: 'Estatística', t: 'ontem', color: '#EF4444', size: '512 KB', type: 'pdf', sharedWith: [] },
]

const TEAM_MEMBERS = [
  { name: 'Prof. Costa', email: 'prof.costa@univ.br', color: '#10B981' },
  { name: 'Lucas M.', email: 'lucas.m@univ.br', color: '#F59E0B' },
  { name: 'Ana Lima', email: 'ana.lima@univ.br', color: '#6366F1' },
  { name: 'Pedro R.', email: 'pedro.r@univ.br', color: '#EC4899' },
]

function fileAppLabel(type: RecentFile['type']) {
  const map: Record<string, string> = { docx: 'Word', xlsx: 'Excel', png: 'Visualizador', pdf: 'Acrobat / PDF', pptx: 'PowerPoint' }
  return map[type] ?? 'App padrão'
}

function FilePreview({ file }: { file: RecentFile }) {
  if (file.type === 'png') {
    return (
      <div style={{ width: '100%', height: 220, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', color: 'var(--tx-3)' }}>
          <Icon name="photo" size={48} style={{ display: 'block', margin: '0 auto 8px', color: file.color }} />
          <div style={{ fontSize: 12 }}>Preview de imagem</div>
        </div>
      </div>
    )
  }
  if (file.type === 'pdf') {
    return (
      <div style={{ width: '100%', height: 220, background: '#1a1a2e', borderRadius: 10, border: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <Icon name="file-text" size={40} style={{ color: file.color }} />
        <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>Documento PDF</div>
        <div style={{ width: '70%', height: 6, background: 'var(--bd-strong)', borderRadius: 3 }} />
        <div style={{ width: '60%', height: 6, background: 'var(--bd-default)', borderRadius: 3 }} />
        <div style={{ width: '75%', height: 6, background: 'var(--bd-strong)', borderRadius: 3 }} />
      </div>
    )
  }
  // docx / xlsx
  const lines = file.type === 'xlsx'
    ? [['Amostra', 'Resultado', 'Status'], ['A1', '0.82', 'OK'], ['A2', '0.79', 'OK'], ['B1', '0.61', 'Revisar']]
    : ['Capítulo 3 — Metodologia', '', 'Nesta seção apresentamos os métodos utilizados...', '', '3.1 Coleta de Dados', 'Os dados foram coletados através de...']

  if (file.type === 'xlsx') {
    return (
      <div style={{ width: '100%', background: '#0f2b1a', borderRadius: 10, border: '1px solid #10B98133', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', background: '#10B98122', fontSize: 11, fontWeight: 700, color: '#10B981' }}>Planilha — {file.name}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {(lines as string[][]).map((row, ri) => (
            <tr key={ri} style={{ background: ri === 0 ? '#10B98111' : ri % 2 === 0 ? 'var(--bg-card)' : 'transparent' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '6px 12px', fontSize: 12, color: ri === 0 ? '#10B981' : 'var(--tx-1)', borderBottom: '1px solid var(--bd-default)', fontWeight: ri === 0 ? 700 : 400 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </table>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', background: '#0d1b2e', borderRadius: 10, border: '1px solid #3B82F633', padding: 16, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 10 }}>Documento — {file.name}</div>
      {(lines as string[]).map((l, i) => (
        <div key={i} style={{ fontSize: 12, color: i === 0 ? 'var(--tx-1)' : 'var(--tx-2)', fontWeight: i === 0 ? 600 : 400, marginBottom: 4, lineHeight: 1.5 }}>{l || <br />}</div>
      ))}
    </div>
  )
}

function FileModal({ file: initialFile, allFiles, onClose }: { file: RecentFile; allFiles: RecentFile[]; onClose: () => void }) {
  const [file, setFile] = useState(initialFile)
  const [tab, setTab] = useState<'preview' | 'share'>('preview')
  const [shareEmail, setShareEmail] = useState('')
  const [sharedWith, setSharedWith] = useState<string[]>(initialFile.sharedWith)
  const [copied, setCopied] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleOpenApp = () => {
    const blob = new Blob([`Arquivo simulado: ${file.name}`], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = () => {
    const blob = new Blob([`Conteúdo simulado de ${file.name}`], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://organizeragend.app/files/${file.id}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addShare = (email: string) => {
    const e = email.trim().toLowerCase()
    if (!e || sharedWith.includes(e)) return
    setSharedWith(prev => [...prev, e])
    setShareEmail('')
  }

  const removeShare = (email: string) => setSharedWith(prev => prev.filter(x => x !== email))

  const suggestedMembers = TEAM_MEMBERS.filter(m => !sharedWith.includes(m.email))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: 720, maxHeight: '88vh', background: 'var(--bg-surface)', borderRadius: 18, border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${file.color}1A`, color: file.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={file.icon} size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
            <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{file.proj} · {file.size} · modificado {file.t}</div>
          </div>
          {/* File switcher chips */}
          <div style={{ display: 'flex', gap: 4 }}>
            {allFiles.map(f => (
              <button key={f.id} onClick={() => { setFile(f); setSharedWith(f.sharedWith); setTab('preview') }}
                title={f.name}
                style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${f.id === file.id ? f.color : 'var(--bd-default)'}`, background: f.id === file.id ? `${f.color}22` : 'var(--bg-card)', color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                <Icon name={f.icon} size={12} />
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--bd-default)', padding: '0 20px', flexShrink: 0 }}>
          {(['preview', 'share'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 14px',
              fontSize: 13, fontWeight: tab === t ? 600 : 500,
              color: tab === t ? 'var(--tx-1)' : 'var(--tx-3)',
              borderBottom: `2px solid ${tab === t ? 'var(--c-primary)' : 'transparent'}`,
              marginBottom: -1,
            }}>
              {t === 'preview' ? <><Icon name="eye" size={13} style={{ marginRight: 5 }} />Visualizar</> : <><Icon name="share" size={13} style={{ marginRight: 5 }} />Compartilhar {sharedWith.length > 0 && <span style={{ marginLeft: 4, fontSize: 10, background: 'var(--c-primary)', color: 'white', borderRadius: 99, padding: '1px 5px' }}>{sharedWith.length}</span>}</>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {tab === 'preview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
              {/* Preview */}
              <div>
                <FilePreview file={file} />
                <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 600, color: 'var(--tx-1)', marginBottom: 6, fontSize: 13 }}>Informações</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}>
                    <span style={{ color: 'var(--tx-3)' }}>Tipo</span><span>.{file.type.toUpperCase()}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Projeto</span><span>{file.proj}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Tamanho</span><span>{file.size}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Modificado</span><span>{file.t}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Compartilhado</span><span>{sharedWith.length > 0 ? `${sharedWith.length} pessoa${sharedWith.length > 1 ? 's' : ''}` : 'Apenas você'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)', marginBottom: 4 }}>Ações</div>

                <button onClick={handleOpenApp} className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}>
                  <Icon name="external-link" size={14} />
                  Abrir no {fileAppLabel(file.type)}
                </button>

                <button onClick={handleDownload} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}>
                  <Icon name="download" size={14} />
                  Download
                </button>

                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => { /* open edit mode */ }}>
                  <Icon name="pencil" size={14} />
                  Editar online
                </button>

                <button onClick={() => setTab('share')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}>
                  <Icon name="share" size={14} />
                  Compartilhar
                </button>

                <button onClick={handleCopyLink} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}>
                  <Icon name={copied ? 'check' : 'link'} size={14} style={{ color: copied ? '#10B981' : undefined }} />
                  {copied ? 'Link copiado!' : 'Copiar link'}
                </button>

                <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)' }}>
                  <div style={{ fontSize: 11, color: 'var(--tx-3)', marginBottom: 6, fontWeight: 600 }}>ACESSOS</div>
                  {sharedWith.length === 0 && <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>Só você tem acesso</div>}
                  {sharedWith.map(email => {
                    const member = TEAM_MEMBERS.find(m => m.email === email)
                    return (
                      <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Avatar name={member?.name ?? email} size={18} color={member?.color ?? '#6366F1'} />
                        <span style={{ fontSize: 11, color: 'var(--tx-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{member?.name ?? email}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'share' && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Convidar por email</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input ref={emailRef} value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addShare(shareEmail)}
                    placeholder="email@exemplo.com"
                    style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
                  <button className="btn btn-primary" onClick={() => addShare(shareEmail)} disabled={!shareEmail.trim()}>
                    <Icon name="plus" size={14} /> Adicionar
                  </button>
                </div>
              </div>

              {suggestedMembers.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)', marginBottom: 10 }}>Membros do time</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {suggestedMembers.map(m => (
                      <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)' }}>
                        <Avatar name={m.name} size={28} color={m.color} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{m.email}</div>
                        </div>
                        <button className="btn btn-sm btn-secondary" onClick={() => addShare(m.email)}>
                          <Icon name="plus" size={12} /> Convidar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sharedWith.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)', marginBottom: 10 }}>Com acesso</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sharedWith.map(email => {
                      const member = TEAM_MEMBERS.find(m => m.email === email)
                      return (
                        <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)' }}>
                          <Avatar name={member?.name ?? email} size={28} color={member?.color ?? '#6366F1'} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{member?.name ?? email}</div>
                            <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{email}</div>
                          </div>
                          <span style={{ fontSize: 11, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Acesso concedido</span>
                          <button className="icon-btn" title="Remover acesso" onClick={() => removeShare(email)}>
                            <Icon name="x" size={13} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="link" size={16} style={{ color: 'var(--tx-3)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Link de acesso</div>
                  <div style={{ fontSize: 11, color: 'var(--tx-3)', fontFamily: 'monospace' }}>organizeragend.app/files/{file.id}</div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={handleCopyLink}>
                  <Icon name={copied ? 'check' : 'copy'} size={12} style={{ color: copied ? '#10B981' : undefined }} />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function AddTaskModal({ onAdd, onClose }: { onAdd: (t: Task) => void; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [projId, setProjId] = useState('')
  const [due, setDue] = useState(() => new Date().toISOString().slice(0, 10))
  const [durMin, setDurMin] = useState(30)
  const [projs, setProjs] = useState<{ id: string; label: string; color: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    projetosApi.list().then(list => {
      const mapped = list.map(p => ({ id: p.id, label: p.nome, color: p.cor }))
      setProjs(mapped)
      if (mapped.length > 0) setProjId(mapped[0].id)
    }).catch(() => {})
  }, [])

  const selected = projs.find(p => p.id === projId)
  const projColor = selected?.color ?? '#6366F1'
  const projLabel = selected?.label ?? ''

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({
      id: `t${Date.now()}`,
      title: title.trim(),
      proj: projLabel, projColor,
      urgency: 'normal',
      due,
      durMin,
      projId,
    })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 480, background: 'var(--bg-surface)', borderRadius: 16,
        border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)',
        padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nova tarefa</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Título *</label>
            <input
              ref={inputRef}
              value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Ex: Estudar capítulo 4 de Cálculo"
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)',
                borderRadius: 8, padding: '9px 12px', fontSize: 14, color: 'var(--tx-1)', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
            />
          </div>

          {/* Project */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Projeto / Disciplina</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {projs.map(p => (
                <button key={p.id} onClick={() => setProjId(p.id)} style={{
                  padding: '5px 12px', borderRadius: 20, border: `1px solid ${projId === p.id ? p.color : 'var(--bd-default)'}`,
                  background: projId === p.id ? p.color + '22' : 'var(--bg-card)',
                  color: projId === p.id ? p.color : 'var(--tx-2)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                  {p.label}
                </button>
              ))}
              {projs.length === 0 && <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>Carregando projetos…</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Due */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Prazo</label>
              <input
                type="date"
                value={due} onChange={e => setDue(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)',
                  borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
              />
            </div>
            {/* Duration */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Duração estimada (min)</label>
              <input
                type="number" min={5} max={480} value={durMin}
                onChange={e => setDurMin(Number(e.target.value))}
                style={{
                  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)',
                  borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!title.trim()}>
            <Icon name="plus" size={14} /> Adicionar tarefa
          </button>
        </div>
      </div>
    </div>
  )
}

const EVENT_COLORS = [
  { label: 'Verde', value: '#10B981' }, { label: 'Índigo', value: '#6366F1' },
  { label: 'Âmbar', value: '#F59E0B' }, { label: 'Rosa', value: '#EC4899' },
  { label: 'Azul', value: '#3B82F6' },
]

function EventModal({
  event, day, onSave, onDelete, onClose,
}: {
  event: CalEvent | null; day: number
  onSave: (day: number, ev: CalEvent) => void
  onDelete: (day: number, id: string) => void
  onClose: () => void
}) {
  const isNew = !event
  const [time, setTime] = useState(event?.time ?? '09:00')
  const [title, setTitle] = useState(event?.title ?? '')
  const [loc, setLoc] = useState(event?.loc ?? '')
  const [color, setColor] = useState(event?.color ?? '#6366F1')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSave = () => {
    if (!title.trim()) return
    onSave(day, { id: event?.id ?? `ev${Date.now()}`, time, title: title.trim(), loc, color })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: 440, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)', padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{isNew ? 'Novo evento' : 'Editar evento'}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Título *</label>
            <input ref={inputRef} value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Ex: Reunião com orientador"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 14, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Horário</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Local</label>
              <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Ex: Sala B-204"
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Cor</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {EVENT_COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)} title={c.label} style={{
                  width: 28, height: 28, borderRadius: '50%', border: color === c.value ? '3px solid var(--tx-1)' : '3px solid transparent',
                  background: c.value, cursor: 'pointer', outline: 'none', padding: 0,
                  boxShadow: color === c.value ? `0 0 0 2px ${c.value}` : 'none',
                }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'space-between' }}>
          <div>
            {!isNew && (
              <button className="btn btn-secondary" style={{ color: 'var(--c-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => { onDelete(day, event!.id); onClose() }}>
                <Icon name="trash" size={14} /> Excluir
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>
              {isNew ? <><Icon name="plus" size={14} /> Adicionar</> : <><Icon name="check" size={14} /> Salvar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const WEEK_DAYS = [
  { d: 'Ter', n: 26, today: true },
  { d: 'Qua', n: 27 },
  { d: 'Qui', n: 28 },
  { d: 'Sex', n: 29 },
  { d: 'Sáb', n: 30 },
  { d: 'Dom', n: 31 },
  { d: 'Seg', n: 1 },
]

export function Dashboard() {
  const { user, logout } = useApp()
  const [taskList, setTaskList] = useState<Task[]>([])
  const [taskState, setTaskState] = useState<TaskStateMap>({})
  const [tasksLoading, setTasksLoading] = useState(true)
  const [quickInput, setQuickInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [fileModal, setFileModal] = useState<RecentFile | null>(null)

  // Arquivos recentes e atividades do banco
  const [recentDocs, setRecentDocs] = useState<DocumentDTO[]>([])
  const [atividades, setAtividades] = useState<AtividadeDTO[]>([])

  // Deadlines computed from tasks
  const deadlineCards = taskList
    .map(t => ({ t, days: parseDueDays(t.due) }))
    .filter(x => x.days !== null)
    .sort((a, b) => (a.days as number) - (b.days as number))

  // Calendar state
  const [selectedDay, setSelectedDay] = useState(26)
  const [calEvents, setCalEvents] = useState<Record<number, CalEvent[]>>(INITIAL_EVENTS)
  const [eventModal, setEventModal] = useState<{ open: boolean; event: CalEvent | null }>({ open: false, event: null })

  // ── Carregar dados do banco quando o usuário mudar ────────────────────
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    setTasksLoading(true)
    tasksApi.list()
      .then(data => {
        if (cancelled) return
        const list: Task[] = data.map(d => ({
          id: d.id,
          title: d.titulo,          // API usa 'titulo'
          proj: d.proj,
          projColor: d.projColor,
          urgency: d.prioridade,    // API usa 'prioridade'
          due: d.due,
          durMin: d.durMin,
        }))
        const states: TaskStateMap = {}
        data.forEach(d => { states[d.id] = d.status as CheckState })
        setTaskList(list)
        setTaskState(states)
      })
      .catch(err => console.error('Erro ao carregar tarefas:', err))
      .finally(() => { if (!cancelled) setTasksLoading(false) })

    eventsApi.list()
      .then(data => {
        if (cancelled) return
        const byDay: Record<number, CalEvent[]> = {}
        data.forEach(ev => {
          if (!byDay[ev.dayNum]) byDay[ev.dayNum] = []
          byDay[ev.dayNum].push({ id: ev.id, time: ev.time, title: ev.titulo, loc: ev.loc || '', color: ev.color })
        })
        setCalEvents(byDay)
      })
      .catch(err => console.error('Erro ao carregar eventos:', err))

    // Arquivos recentes (últimos 4 por updatedAt)
    docsApi.list()
      .then(data => {
        if (cancelled) return
        const sorted = [...data].sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())
        setRecentDocs(sorted.slice(0, 4))
      })
      .catch(() => {})

    // Atividades do time — busca de todos os projetos do usuário
    projetosApi.list()
      .then(async projList => {
        if (cancelled) return
        const all: AtividadeDTO[] = []
        for (const p of projList.slice(0, 5)) {
          try {
            const atv = await projetosApi.listAtividades(p.id)
            all.push(...atv)
          } catch { /* silencioso */ }
        }
        if (!cancelled) {
          all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setAtividades(all.slice(0, 5))
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [userId])

  // ── CRUD Tarefas ───────────────────────────────────────────────────────
  const addTask = async (t: Task) => {
    try {
      const body: Parameters<typeof tasksApi.create>[0] = {
        titulo: t.title, proj: t.proj, projColor: t.projColor,
        prioridade: t.urgency, due: t.due, durMin: t.durMin,
      }
      if (t.projId) (body as Record<string, unknown>).projetoId = t.projId
      const created = await tasksApi.create(body)
      setTaskList(prev => [...prev, { ...t, id: created.id }])
      setTaskState(prev => ({ ...prev, [created.id]: 'none' }))
    } catch (err) { console.error(err) }
  }

  const removeTask = async (id: string) => {
    try {
      await tasksApi.remove(id)
      setTaskList(prev => prev.filter(t => t.id !== id))
      setTaskState(prev => { const s = { ...prev }; delete s[id]; return s })
    } catch (err) { console.error(err) }
  }

  const updateTaskState = async (id: string, state: CheckState) => {
    setTaskState(prev => ({ ...prev, [id]: state }))
    try { await tasksApi.update(id, { status: state }) } catch (err) { console.error(err) }
  }

  // ── CRUD Eventos ───────────────────────────────────────────────────────
  const saveEvent = async (day: number, ev: CalEvent) => {
    try {
      // Se o id começa com 'ev' é um novo evento criado localmente (ainda não está no banco)
      const existsInDB = !ev.id.startsWith('ev') && calEvents[day]?.some(e => e.id === ev.id)
      if (existsInDB) {
        await eventsApi.update(ev.id, { time: ev.time, titulo: ev.title, loc: ev.loc, color: ev.color })
        setCalEvents(prev => ({
          ...prev,
          [day]: (prev[day] ?? []).map(e => e.id === ev.id ? ev : e),
        }))
      } else {
        const created = await eventsApi.create({ time: ev.time, titulo: ev.title, loc: ev.loc, color: ev.color, dayNum: day })
        setCalEvents(prev => {
          const existing = prev[day] ?? []
          return { ...prev, [day]: [...existing, { ...ev, id: created.id }].sort((a, b) => a.time.localeCompare(b.time)) }
        })
      }
    } catch (err) { console.error(err) }
  }

  const deleteEvent = async (day: number, id: string) => {
    try {
      await eventsApi.remove(id)
      setCalEvents(prev => ({ ...prev, [day]: (prev[day] ?? []).filter(e => e.id !== id) }))
    } catch (err) { console.error(err) }
  }

  const dayEvents = calEvents[selectedDay] ?? []
  // Tasks due on the selected day
  const dayTasks = taskList.filter(t => dueToWeekDay(t.due) === selectedDay)
  // Total items (events + tasks) for dot count per day
  const dayItemCount = (n: number) =>
    (calEvents[n] ?? []).length + taskList.filter(t => dueToWeekDay(t.due) === n).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 300px', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>

      <Sidebar />

      {/* ===== MAIN ===== */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--bd-default)' }}>
        {/* Topbar */}
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tx-2)', fontSize: 13 }}>
            <Icon name="home" size={14} />
            <span>Início</span>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 400, height: 36, background: 'var(--bg-base)', border: '1px solid var(--bd-default)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, cursor: 'pointer' }}>
              <Icon name="search" size={14} style={{ color: 'var(--tx-3)' }} />
              <span style={{ flex: 1, color: 'var(--tx-3)', fontSize: 13 }}>Buscar em tudo…</span>
              <span className="kbd">⌘</span><span className="kbd">K</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="icon-btn" style={{ position: 'relative' }}>
              <Icon name="bell" size={16} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--c-danger)', border: '2px solid var(--bg-base)' }} />
            </button>
            <button className="icon-btn" title="Sair" onClick={logout} style={{ opacity: 0.7 }}>
              <Icon name="logout" size={16} />
            </button>
            <Avatar name={user?.nome ?? 'U'} size={28} color="#6366F1" />
          </div>
        </header>

        {/* Content */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px 32px' }}>
          {/* Greeting */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--tx-1)' }}>
              {greeting()}, {user?.nome?.split(' ')[0] ?? 'você'}.{' '}
              <span style={{ color: 'var(--tx-2)', fontWeight: 500 }}>Aqui está seu dia.</span>
            </h1>
            <span style={{ color: 'var(--tx-2)', fontSize: 13, textTransform: 'capitalize' }}>{todayLabel()}</span>
          </div>

          {/* AI Summary */}
          <div className="card-ai" style={{ marginBottom: 24, padding: 20, boxShadow: 'var(--sh-glow)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}><Sparkle size={22} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Resumo do seu dia</span>
                  <Badge tone="ai">Gerado pela IA · há 2 min</Badge>
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--tx-1)' }}>
                  Hoje você tem <strong>2 entregas com prazo curto</strong> (TCC · capítulo 3 e Estatística · lista 5). Sugiro começar pela <strong>lista de Estatística</strong> — leva ~90min e libera você para focar no capítulo do TCC à tarde. Seu orientador respondeu o email das 14h de ontem.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary"><Icon name="list-check" size={13} /> Priorizar meu dia</button>
                  <button className="btn btn-sm btn-secondary"><Icon name="calendar-plus" size={13} /> Bloquear agenda</button>
                  <button className="btn btn-sm btn-ghost"><Icon name="refresh" size={13} /> Regenerar</button>
                </div>
              </div>
            </div>
          </div>

          {/* 2-col: tasks (principal) + calendar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 24, marginBottom: 32, alignItems: 'start' }}>
            {/* ===== HOJE — foco principal ===== */}
            <section className="card" style={{ padding: 0, boxShadow: '0 0 0 1px var(--bd-default), 0 4px 24px rgba(0,0,0,0.18)' }}>
              {/* Header */}
              <div style={{ padding: '18px 22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--bd-default)', background: 'linear-gradient(90deg, rgba(245,158,11,0.07) 0%, transparent 60%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="flame" size={20} style={{ color: 'var(--c-warning)' }} />
                  </div>
                  <div>
                    <h2 className="t-h2" style={{ margin: 0, fontSize: 18, letterSpacing: '-0.01em' }}>Hoje</h2>
                    <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1 }}>
                      {taskList.filter(t => (taskState[t.id] ?? 'none') === 'done').length} de {taskList.length} concluídas
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Mini progress bar */}
                  <div style={{ width: 80, height: 6, background: 'var(--bd-default)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99, background: 'var(--c-warning)',
                      width: taskList.length > 0 ? `${(taskList.filter(t => (taskState[t.id] ?? 'none') === 'done').length / taskList.length) * 100}%` : '0%',
                      transition: 'width 400ms ease',
                    }} />
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Icon name="plus" size={14} /> Adicionar tarefa
                  </button>
                </div>
              </div>

              {/* Task rows */}
              <div>
                {taskList.map((t, i) => {
                  const state = taskState[t.id] ?? 'none'
                  const isDone = state === 'done'
                  const isPartial = state === 'partial'
                  const isUrgent = t.urgency === 'urgent' && !isDone && !isPartial
                  return (
                    <div key={t.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 22px',
                        borderBottom: i < taskList.length - 1 ? '1px solid var(--bd-default)' : 'none',
                        borderLeft: `3px solid ${isDone ? 'transparent' : isPartial ? '#F59E0B' : isUrgent ? 'var(--c-danger)' : t.projColor}`,
                        opacity: isDone ? 0.5 : 1, transition: 'opacity 200ms, background 120ms',
                        cursor: 'pointer',
                      }}
                      onMouseOver={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'
                        const btns = (e.currentTarget as HTMLDivElement).querySelectorAll<HTMLButtonElement>('.row-action')
                        btns.forEach(b => (b.style.opacity = '1'))
                      }}
                      onMouseOut={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                        const btns = (e.currentTarget as HTMLDivElement).querySelectorAll<HTMLButtonElement>('.row-action')
                        btns.forEach(b => (b.style.opacity = '0'))
                      }}
                    >
                      <CheckCircle state={state} onChange={v => updateTaskState(t.id, v)} color={t.projColor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx-1)', textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--tx-3)', lineHeight: 1.35 }}>
                          {t.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, fontSize: 12, color: 'var(--tx-2)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.projColor }} />
                            {t.proj}
                          </span>
                          <span style={{ color: 'var(--tx-3)' }}>·</span>
                          <span>{t.due}</span>
                          <span style={{ color: 'var(--tx-3)' }}>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={12} /> {t.durMin}min</span>
                        </div>
                      </div>
                      {t.urgency === 'urgent' && !isDone && !isPartial && <Badge tone="urgent" icon="alert-triangle">Urgente</Badge>}
                      {t.urgency === 'attention' && !isDone && !isPartial && <Badge tone="attention" icon="clock">Atenção</Badge>}
                      {isPartial && <Badge tone="attention" icon="clock">Em andamento</Badge>}
                      {isDone && <Badge tone="done" icon="check">Feita</Badge>}

                      <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                        <button className="row-action" onClick={e => { e.stopPropagation(); setShowModal(true) }} title="Adicionar tarefa"
                          style={{ opacity: 0, transition: 'opacity 150ms', width: 30, height: 30, borderRadius: 6, border: '1px solid var(--bd-default)', background: 'var(--bg-card)', color: 'var(--c-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Icon name="plus" size={14} />
                        </button>
                        <button className="row-action" onClick={e => { e.stopPropagation(); removeTask(t.id) }} title="Excluir tarefa"
                          style={{ opacity: 0, transition: 'opacity 150ms', width: 30, height: 30, borderRadius: 6, border: '1px solid var(--bd-default)', background: 'var(--bg-card)', color: 'var(--c-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {tasksLoading && (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--tx-3)', fontSize: 13 }}>
                    <Icon name="loader" size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                    Carregando tarefas...
                  </div>
                )}
                {!tasksLoading && taskList.length === 0 && (
                  <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--tx-3)', fontSize: 14 }}>
                    <Icon name="checklist" size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                    Nenhuma tarefa para hoje
                    <br />
                    <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => setShowModal(true)}>
                      <Icon name="plus" size={13} /> Adicionar tarefa
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Mini calendar */}
            <section className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="t-h3" style={{ margin: 0 }}>Esta semana</h3>
                <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>Mai 26 – Jun 1</span>
              </div>

              {/* Day selector — dots reflect events + tasks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 8px 6px', gap: 2 }}>
                {WEEK_DAYS.map(day => {
                  const isSelected = day.n === selectedDay
                  const isToday = !!day.today
                  const total = dayItemCount(day.n)
                  return (
                    <button key={day.n} onClick={() => setSelectedDay(day.n)} style={{
                      textAlign: 'center', padding: '6px 2px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: isSelected ? 'var(--c-primary)' : isToday ? 'var(--c-primary-soft)' : 'transparent',
                      transition: 'background 150ms',
                    }}
                      onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)' }}
                      onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = isToday ? 'var(--c-primary-soft)' : 'transparent' }}
                    >
                      <div style={{ fontSize: 9, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--tx-3)', marginBottom: 3, textTransform: 'uppercase', fontWeight: 600 }}>{day.d}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? 'white' : isToday ? 'var(--c-primary)' : 'var(--tx-1)' }}>{day.n}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3, height: 4 }}>
                        {[...Array(Math.min(total, 3))].map((_, j) => (
                          <span key={j} style={{ width: 4, height: 4, borderRadius: 99, background: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--c-primary)', opacity: 0.7 }} />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Events + Tasks for selected day */}
              <div style={{ padding: '4px 12px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 6px 8px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)' }}>
                    {selectedDay === 26 ? 'Hoje' : `Dia ${selectedDay}`} · {dayEvents.length + dayTasks.length} item{dayEvents.length + dayTasks.length !== 1 ? 's' : ''}
                  </span>
                  <button onClick={() => setEventModal({ open: true, event: null })}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--c-primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}>
                    <Icon name="plus" size={11} /> Evento
                  </button>
                </div>

                {dayEvents.length === 0 && dayTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--tx-3)', fontSize: 12 }}>
                    Nenhuma atividade · <button onClick={() => setEventModal({ open: true, event: null })} style={{ background: 'none', border: 'none', color: 'var(--c-primary)', fontSize: 12, cursor: 'pointer', padding: 0 }}>adicionar evento</button>
                  </div>
                )}

                {/* Calendar events (editáveis) */}
                {dayEvents.map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderRadius: 6, cursor: 'pointer', transition: 'background 120ms', position: 'relative' }}
                    onMouseOver={ev => {
                      (ev.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'
                      const a = (ev.currentTarget as HTMLDivElement).querySelector<HTMLDivElement>('.ev-actions')
                      if (a) a.style.opacity = '1'
                    }}
                    onMouseOut={ev => {
                      (ev.currentTarget as HTMLDivElement).style.background = 'transparent'
                      const a = (ev.currentTarget as HTMLDivElement).querySelector<HTMLDivElement>('.ev-actions')
                      if (a) a.style.opacity = '0'
                    }}
                    onClick={() => setEventModal({ open: true, event: e })}
                  >
                    <span className="mono" style={{ fontSize: 11, color: 'var(--tx-2)', width: 34, flexShrink: 0 }}>{e.time}</span>
                    <span style={{ width: 3, alignSelf: 'stretch', background: e.color, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                      {e.loc && <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{e.loc}</div>}
                    </div>
                    <div className="ev-actions" style={{ opacity: 0, transition: 'opacity 120ms', display: 'flex', gap: 2 }} onClick={ev => ev.stopPropagation()}>
                      <button onClick={() => setEventModal({ open: true, event: e })}
                        style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--bd-default)', background: 'var(--bg-card)', color: 'var(--tx-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Icon name="pencil" size={11} />
                      </button>
                      <button onClick={() => deleteEvent(selectedDay, e.id)}
                        style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--bd-default)', background: 'var(--bg-card)', color: 'var(--c-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Icon name="trash" size={11} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Divisor se tiver os dois */}
                {dayEvents.length > 0 && dayTasks.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', margin: '2px 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--bd-default)' }} />
                    <span style={{ fontSize: 10, color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tarefas</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--bd-default)' }} />
                  </div>
                )}

                {/* Tasks due this day (informativo, reflete estado) */}
                {dayTasks.map(t => {
                  const st = taskState[t.id] ?? 'none'
                  const isDone = st === 'done'
                  const isPartial = st === 'partial'
                  return (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 6px',
                      borderRadius: 6, opacity: isDone ? 0.5 : 1, transition: 'opacity 200ms',
                    }}>
                      {/* State indicator */}
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        background: isDone ? '#10B981' : isPartial ? '#F59E0B' : t.projColor,
                        border: isDone || isPartial ? 'none' : `2px solid ${t.projColor}`,
                        boxSizing: 'border-box',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--tx-3)' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--tx-3)' }}>{t.proj}</div>
                      </div>
                      {isDone && <Icon name="check" size={11} style={{ color: '#10B981', flexShrink: 0 }} />}
                      {isPartial && <Icon name="clock" size={11} style={{ color: '#F59E0B', flexShrink: 0 }} />}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Deadlines — read-only, derived from tasks */}
          <section>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingTop: 8, borderTop: '1px solid var(--bd-default)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="alarm" size={20} style={{ color: 'var(--c-danger)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="t-h2" style={{ margin: 0, fontSize: 18 }}>Prazos próximos</h2>
                <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 1 }}>
                  {deadlineCards.filter(({ t }) => (taskState[t.id] ?? 'none') === 'none').length} pendente{deadlineCards.filter(({ t }) => (taskState[t.id] ?? 'none') === 'none').length !== 1 ? 's' : ''} · {deadlineCards.length} no total
                </div>
              </div>
            </div>

            {deadlineCards.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--tx-3)', fontSize: 13, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--bd-default)' }}>
                <Icon name="alarm-off" size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                Nenhuma tarefa com prazo definido
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {deadlineCards.map(({ t, days }) => {
                const state = taskState[t.id] ?? 'none'
                const isDone = state === 'done'
                const isPartial = state === 'partial'
                const color = deadlineColor(days as number, state)
                return (
                  <div key={t.id} className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      opacity: isDone ? 0.55 : 1,
                      transition: 'opacity 300ms',
                      position: 'relative',
                      border: `1px solid ${isDone ? 'var(--bd-default)' : color + '55'}`,
                    }}
                  >
                    {/* Top color stripe */}
                    <div style={{ height: 4, background: isDone ? '#10B981' : isPartial ? `linear-gradient(90deg, #F59E0B 50%, var(--bd-default) 50%)` : color, transition: 'background 300ms' }} />

                    <div style={{ padding: '16px 20px 18px' }}>
                      {/* Days + label row */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div className="mono" style={{ fontSize: 40, fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1, textDecoration: isDone ? 'line-through' : 'none' }}>
                          {days}d
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{dayLabel(days as number)}</div>
                          {isDone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', fontSize: 10, fontWeight: 600, color: '#10B981', marginTop: 3 }}>
                              <Icon name="check" size={10} /> Concluída
                            </div>
                          )}
                          {isPartial && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', fontSize: 10, fontWeight: 600, color: '#F59E0B', marginTop: 3 }}>
                              <Icon name="clock" size={10} /> Em andamento
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.35, textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: 'var(--tx-3)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--tx-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.projColor, flexShrink: 0 }} />
                        {t.proj}
                        <span style={{ color: 'var(--tx-3)' }}>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size={11} /> {t.durMin}min</span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginTop: 14, height: 4, background: 'var(--bd-default)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          width: isDone ? '100%' : isPartial ? '50%' : '0%',
                          height: '100%',
                          background: isDone ? '#10B981' : '#F59E0B',
                          borderRadius: 99,
                          transition: 'width 400ms ease',
                        }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      {/* ===== RIGHT panel ===== */}
      <aside style={{ background: 'var(--bg-surface)', padding: '20px 18px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="scroll">

        {/* Quick chat */}
        <div className="card-ai" style={{ padding: 14 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkle size={16} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Pergunte ao OrganizerAgend</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="Resuma a aula de Estatística…"
              value={quickInput} onChange={e => setQuickInput(e.target.value)}
              style={{ paddingRight: 40, background: 'rgba(0,0,0,0.25)', borderColor: 'var(--c-primary-border)' }} />
            <button style={{ position: 'absolute', right: 4, top: 4, width: 28, height: 28, borderRadius: 6, border: 'none', background: 'var(--grad-ai)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-up" size={14} style={{ color: 'white' }} />
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['Resumir aula', 'O que fazer agora?', 'Gerar mapa mental'].map(s => (
              <button key={s} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 99, border: '1px solid var(--bd-default)', background: 'transparent', color: 'var(--tx-2)', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Recent files — dinâmico */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h4 className="t-h3" style={{ margin: 0 }}>Arquivos recentes</h4>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 2 }}
              title="Upload novo arquivo"
              onClick={async () => {
                const nome = prompt('Nome do arquivo (ex: relatorio.pdf):')
                if (!nome) return
                const ext = nome.split('.').pop()?.toLowerCase() ?? 'pdf'
                const tipos = ['docx','xlsx','pdf','png','pptx']
                const tipo = tipos.includes(ext) ? ext : 'pdf'
                try {
                  const doc = await docsApi.create({ nome, tipo })
                  setRecentDocs(prev => [doc, ...prev].slice(0, 4))
                } catch (e: any) { alert(e.message) }
              }}>
              <Icon name="plus" size={14} />
            </button>
          </div>
          {recentDocs.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--tx-3)', padding: '8px 6px' }}>Nenhum arquivo ainda</div>
          )}
          {recentDocs.map(doc => {
            const iconMap: Record<string, string> = { docx: 'file-text', xlsx: 'file-spreadsheet', pdf: 'file-text', png: 'photo', pptx: 'presentation' }
            const colorMap: Record<string, string> = { docx: '#3B82F6', xlsx: '#10B981', pdf: '#EF4444', png: '#8B5CF6', pptx: '#F59E0B' }
            const icon = iconMap[doc.tipo] ?? 'file'
            const color = colorMap[doc.tipo] ?? '#6366F1'
            const projNome = doc.projeto?.nome ?? '—'
            const ago = (() => {
              const diff = Date.now() - new Date(doc.updatedAt ?? doc.createdAt).getTime()
              const min = Math.floor(diff / 60000)
              if (min < 60) return `há ${min}min`
              const h = Math.floor(min / 60)
              if (h < 24) return `há ${h}h`
              return `há ${Math.floor(h / 24)}d`
            })()
            // Converte para RecentFile para o modal existente
            const asRecentFile: RecentFile = { id: doc.id, icon, name: doc.nome, proj: projNome, t: ago, color, size: doc.tamanho ?? '—', type: doc.tipo as RecentFile['type'], sharedWith: (doc.acessos ?? []).map(a => a.email) }
            return (
              <div key={doc.id}
                onClick={() => setFileModal(asRecentFile)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, cursor: 'pointer', position: 'relative', transition: 'background 120ms' }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)'
                  const btns = (e.currentTarget as HTMLDivElement).querySelector<HTMLDivElement>('.rf-actions')
                  if (btns) btns.style.opacity = '1'
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  const btns = (e.currentTarget as HTMLDivElement).querySelector<HTMLDivElement>('.rf-actions')
                  if (btns) btns.style.opacity = '0'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{projNome} · {ago}</div>
                </div>
                <div className="rf-actions" style={{ opacity: 0, transition: 'opacity 150ms', display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                  <button title="Download" onClick={() => {
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(new Blob([doc.nome], { type: 'application/octet-stream' }))
                    a.download = doc.nome; a.click()
                  }} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--bd-default)', background: 'var(--bg-surface)', color: 'var(--tx-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="download" size={11} />
                  </button>
                  <button title="Compartilhar" onClick={() => setFileModal(asRecentFile)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--bd-default)', background: 'var(--bg-surface)', color: 'var(--tx-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="share" size={11} />
                  </button>
                  <button title="Excluir" onClick={async () => {
                    if (!confirm(`Excluir "${doc.nome}"?`)) return
                    try { await docsApi.remove(doc.id); setRecentDocs(prev => prev.filter(d => d.id !== doc.id)) } catch { /* */ }
                  }} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--bd-default)', background: 'var(--bg-surface)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="trash" size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Productivity — dynamic */}
        {(() => {
          const total = taskList.length
          const done = taskList.filter(t => taskState[t.id] === 'done').length
          const partial = taskList.filter(t => taskState[t.id] === 'partial').length
          const todayRatio = total > 0 ? done / total : 0
          const partialRatio = total > 0 ? (done + partial * 0.5) / total : 0
          const barBases = [0.4, 0.65, 0.5, 0.8, 0.3, 0.6]
          const bars = [...barBases.slice(0, 6), Math.max(0.08, todayRatio)]
          return (
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 className="t-h3" style={{ margin: 0 }}>Esta semana</h4>
                {partialRatio > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--c-success)', fontWeight: 600 }}>
                    {Math.round(partialRatio * 100)}%
                  </span>
                )}
              </div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
                {done} {done === 1 ? 'tarefa' : 'tarefas'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx-2)', marginBottom: 6 }}>
                concluída{done !== 1 ? 's' : ''} hoje
              </div>
              {partial > 0 && (
                <div style={{ fontSize: 11, color: 'var(--c-warning)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="clock" size={11} /> {partial} em andamento
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--tx-3)', marginBottom: 14 }}>
                {total - done - partial} restante{total - done - partial !== 1 ? 's' : ''} · {total} no total
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 48 }}>
                {bars.map((v, i) => (
                  <div key={i} style={{ flex: 1, height: `${v * 100}%`, background: i === 6 ? 'var(--c-primary)' : 'var(--bd-strong)', borderRadius: 3, transition: 'height 400ms ease' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--tx-3)' }}>
                {['S','T','Q','Q','S','S','H'].map((d,i) => <span key={i} style={i === 6 ? { color: 'var(--c-primary)', fontWeight: 600 } : {}}>{d}</span>)}
              </div>
            </div>
          )
        })()}

        {/* Atividade do time — dinâmico */}
        <div>
          <h4 className="t-h3" style={{ margin: '0 0 10px' }}>Atividade do time</h4>
          {atividades.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--tx-3)', padding: '6px 0' }}>Nenhuma atividade ainda</div>
          )}
          {atividades.map(a => {
            const COLORS: Record<string, string> = { comentou: '#10B981', compartilhou: '#F59E0B', concluiu: '#6366F1', criou: '#3B82F6', atualizou: '#8B5CF6', enviou: '#EC4899', mencionou: '#F59E0B' }
            const color = COLORS[a.tipo] ?? '#6366F1'
            const ago = (() => {
              const diff = Date.now() - new Date(a.createdAt).getTime()
              const min = Math.floor(diff / 60000)
              if (min < 60) return `há ${min}min`
              const h = Math.floor(min / 60)
              if (h < 24) return `há ${h}h`
              return `há ${Math.floor(h / 24)}d`
            })()
            return (
              <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 6px', alignItems: 'flex-start' }}>
                <Avatar name={a.nomeUsuario} size={24} color={color} />
                <div style={{ flex: 1, fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--tx-1)', fontWeight: 500 }}>{a.nomeUsuario}</span> {a.descricao}
                  <div style={{ fontSize: 10, color: 'var(--tx-3)', marginTop: 2 }}>{ago}</div>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />}
      {fileModal && <FileModal file={fileModal} allFiles={recentDocs.map(doc => {
        const iconMap: Record<string,string> = { docx:'file-text', xlsx:'file-spreadsheet', pdf:'file-text', png:'photo', pptx:'presentation' }
        const colorMap: Record<string,string> = { docx:'#3B82F6', xlsx:'#10B981', pdf:'#EF4444', png:'#8B5CF6', pptx:'#F59E0B' }
        return { id: doc.id, icon: iconMap[doc.tipo] ?? 'file', name: doc.nome, proj: doc.projeto?.nome ?? '—', t: '—', color: colorMap[doc.tipo] ?? '#6366F1', size: doc.tamanho ?? '—', type: doc.tipo as RecentFile['type'], sharedWith: (doc.acessos ?? []).map(a => a.email) }
      })} onClose={() => setFileModal(null)} />}

      {eventModal.open && (
        <EventModal
          event={eventModal.event}
          day={selectedDay}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setEventModal({ open: false, event: null })}
        />
      )}
    </div>
  )
}
