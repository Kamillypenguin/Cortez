import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon, Avatar } from '../../components/ui'
import { documents as docsApi } from '../../services/api'
import type { DocumentDTO } from '../../services/api'
import { useApp } from '../../lib/context'

// ─── Tipos ──────────────────────────────────────────────────────────────────────
type FileType = 'docx' | 'xlsx' | 'pdf' | 'png' | 'jpg' | 'pptx' | 'txt' | 'zip' | 'other'
type ViewLayout = 'grid' | 'list'

interface LocalFile {
  id: string; name: string; type: FileType; size: string
  proj: string; projColor: string; modifiedAt: string
  sharedWith: string[]; url?: string
  isUploading?: boolean; uploadProgress?: number
}

// ─── Constantes ────────────────────────────────────────────────────────────────
// Sem dados hardcoded — preenchido dinamicamente a partir dos acessos dos documentos
const TEAM_MEMBERS: { name: string; email: string; color: string }[] = []

// ─── Helpers ────────────────────────────────────────────────────────────────────
function fileIcon(type: FileType): { icon: string; color: string } {
  const map: Record<FileType, { icon: string; color: string }> = {
    docx:  { icon: 'file-text',        color: '#3B82F6' },
    xlsx:  { icon: 'file-spreadsheet', color: '#10B981' },
    pdf:   { icon: 'file-type-pdf',    color: '#EF4444' },
    png:   { icon: 'photo',            color: '#8B5CF6' },
    jpg:   { icon: 'photo',            color: '#8B5CF6' },
    pptx:  { icon: 'presentation',     color: '#F59E0B' },
    txt:   { icon: 'file-text',        color: '#6B7280' },
    zip:   { icon: 'file-zip',         color: '#92400E' },
    other: { icon: 'file',             color: '#6B7280' },
  }
  return map[type] ?? map.other
}

function extToType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const m: Record<string, FileType> = { docx:'docx', doc:'docx', xlsx:'xlsx', xls:'xlsx', pdf:'pdf', png:'png', jpg:'jpg', jpeg:'jpg', pptx:'pptx', ppt:'pptx', txt:'txt', zip:'zip' }
  return m[ext] ?? 'other'
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)    return 'agora'
  if (min < 60)   return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24)     return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1)    return 'ontem'
  if (d < 7)      return `${d} dias`
  const w = Math.floor(d / 7)
  if (w === 1)    return '1 sem'
  return `${w} sem`
}

function dtoToLocal(d: DocumentDTO): LocalFile {
  return {
    id: d.id, name: d.nome, type: extToType(d.nome), size: d.tamanho ?? '—',
    proj: d.projeto?.nome ?? 'Geral',
    projColor: d.projeto?.cor ?? '#6366F1',
    modifiedAt: relativeTime(d.updatedAt),
    sharedWith: d.acessos?.map(a => a.email) ?? [],
    url: d.url ?? undefined,
  }
}

// ─── Preview de arquivo ─────────────────────────────────────────────────────────
function FilePreview({ file }: { file: LocalFile }) {
  const fi = fileIcon(file.type)
  if (file.type === 'png' || file.type === 'jpg') {
    return (
      <div style={{ width: '100%', height: 200, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {file.url ? (
          <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--tx-3)' }}>
            <Icon name="photo" size={48} style={{ display: 'block', margin: '0 auto 8px', color: fi.color }} />
            <div style={{ fontSize: 12 }}>Preview de imagem</div>
          </div>
        )}
      </div>
    )
  }
  if (file.type === 'xlsx') {
    return (
      <div style={{ width: '100%', background: '#0f2b1a', borderRadius: 10, border: '1px solid #10B98133', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', background: '#10B98122', fontSize: 11, fontWeight: 700, color: '#10B981' }}>Planilha — {file.name}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {[['Amostra','Resultado','Status'],['A1','0.82','OK'],['A2','0.79','OK'],['B1','0.61','Revisar']].map((row, ri) => (
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
  if (file.type === 'pdf') {
    return (
      <div style={{ width: '100%', height: 200, background: '#1a0a0a', borderRadius: 10, border: '1px solid #EF444433', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon name="file-type-pdf" size={40} style={{ color: '#EF4444' }} />
        <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>Documento PDF</div>
        {[70, 55, 80, 45, 65].map((w, i) => (
          <div key={i} style={{ width: `${w}%`, height: 5, background: i % 2 === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)', borderRadius: 3 }} />
        ))}
      </div>
    )
  }
  // docx / pptx / txt / other
  return (
    <div style={{ width: '100%', background: `${fi.color}0d`, borderRadius: 10, border: `1px solid ${fi.color}33`, padding: 16, minHeight: 120 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: fi.color, marginBottom: 10 }}>{file.name}</div>
      {['Conteúdo do documento...', '', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', '', 'Seção 1 — Introdução', 'Nesta seção apresentamos...'].map((l, i) => (
        <div key={i} style={{ fontSize: 12, color: i === 0 ? 'var(--tx-1)' : 'var(--tx-2)', fontWeight: i === 0 ? 600 : 400, marginBottom: 4, lineHeight: 1.5 }}>{l || <br />}</div>
      ))}
    </div>
  )
}

// ─── Modal de arquivo ───────────────────────────────────────────────────────────
function FileModal({ file, allFiles, onClose, onDelete }: {
  file: LocalFile; allFiles: LocalFile[]
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const [current,     setCurrent]     = useState(file)
  const [tab,         setTab]         = useState<'preview' | 'share'>('preview')
  const [shareEmail,  setShareEmail]  = useState('')
  const [sharedWith,  setSharedWith]  = useState<string[]>(file.sharedWith)
  const [copied,      setCopied]      = useState(false)
  const fi = fileIcon(current.type)

  const addShare = (email: string) => {
    const e = email.trim().toLowerCase()
    if (!e || sharedWith.includes(e)) return
    setSharedWith(prev => [...prev, e]); setShareEmail('')
  }
  const removeShare = (email: string) => setSharedWith(prev => prev.filter(x => x !== email))
  const copyLink = () => {
    navigator.clipboard.writeText(`https://organizeragend.app/files/${current.id}`).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const download = () => {
    const blob = new Blob([`Conteúdo simulado de ${current.name}`], { type: 'application/octet-stream' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = current.name; a.click()
    URL.revokeObjectURL(url)
  }
  const suggestedMembers = TEAM_MEMBERS.filter(m => !sharedWith.includes(m.email))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: 740, maxHeight: '88vh', background: 'var(--bg-surface)', borderRadius: 18, border: '1px solid var(--bd-strong)', boxShadow: 'var(--sh-3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: `${fi.color}1A`, color: fi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={fi.icon} size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.name}</div>
            <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{current.proj} · {current.size} · {current.modifiedAt}</div>
          </div>
          {/* Switcher de arquivos */}
          <div style={{ display: 'flex', gap: 4 }}>
            {allFiles.slice(0, 6).map(f => {
              const ffi = fileIcon(f.type)
              return (
                <button key={f.id} onClick={() => { setCurrent(f); setSharedWith(f.sharedWith); setTab('preview') }}
                  title={f.name} style={{
                    width: 26, height: 26, borderRadius: 6, border: `1.5px solid ${f.id === current.id ? ffi.color : 'var(--bd-default)'}`,
                    background: f.id === current.id ? `${ffi.color}22` : 'var(--bg-card)', color: ffi.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
                  }}>
                  <Icon name={ffi.icon} size={13} />
                </button>
              )
            })}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bd-default)', padding: '0 20px', flexShrink: 0 }}>
          {(['preview', 'share'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 14px',
              fontSize: 13, fontWeight: tab === t ? 600 : 500,
              color: tab === t ? 'var(--tx-1)' : 'var(--tx-3)',
              borderBottom: `2px solid ${tab === t ? 'var(--c-primary)' : 'transparent'}`, marginBottom: -1,
            }}>
              {t === 'preview' ? (
                <><Icon name="eye" size={13} style={{ marginRight: 5 }} />Visualizar</>
              ) : (
                <><Icon name="share" size={13} style={{ marginRight: 5 }} />Compartilhar {sharedWith.length > 0 && <span style={{ marginLeft: 4, fontSize: 10, background: 'var(--c-primary)', color: 'white', borderRadius: 99, padding: '1px 5px' }}>{sharedWith.length}</span>}</>
              )}
            </button>
          ))}
        </div>

        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {tab === 'preview' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
              <div>
                <FilePreview file={current} />
                <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 600, color: 'var(--tx-1)', marginBottom: 6, fontSize: 13 }}>Informações</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}>
                    <span style={{ color: 'var(--tx-3)' }}>Tipo</span><span>.{current.type.toUpperCase()}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Projeto</span><span>{current.proj}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Tamanho</span><span>{current.size}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Modificado</span><span>{current.modifiedAt}</span>
                    <span style={{ color: 'var(--tx-3)' }}>Compartilhado</span>
                    <span>{sharedWith.length > 0 ? `${sharedWith.length} pessoa${sharedWith.length > 1 ? 's' : ''}` : 'Apenas você'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)', marginBottom: 4 }}>Ações</div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}><Icon name="external-link" size={14} /> Abrir</button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} onClick={download}><Icon name="download" size={14} /> Download</button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }}><Icon name="pencil" size={14} /> Editar online</button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} onClick={() => setTab('share')}><Icon name="share" size={14} /> Compartilhar</button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 10 }} onClick={copyLink}>
                  <Icon name={copied ? 'check' : 'link'} size={14} style={{ color: copied ? '#10B981' : undefined }} />
                  {copied ? 'Link copiado!' : 'Copiar link'}
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 10, color: 'var(--c-danger)' }} onClick={() => { onDelete(current.id); onClose() }}>
                  <Icon name="trash" size={14} /> Excluir
                </button>
                {sharedWith.length > 0 && (
                  <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)' }}>
                    <div style={{ fontSize: 10, color: 'var(--tx-3)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Acessos</div>
                    {sharedWith.map(email => {
                      const m = TEAM_MEMBERS.find(x => x.email === email)
                      return (
                        <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Avatar name={m?.name ?? email} size={18} color={m?.color ?? '#6366F1'} />
                          <span style={{ fontSize: 11, color: 'var(--tx-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m?.name ?? email}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Convidar por email</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={shareEmail} onChange={e => setShareEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addShare(shareEmail)} placeholder="email@exemplo.com"
                    style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--tx-1)', outline: 'none' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
                  <button className="btn btn-primary" onClick={() => addShare(shareEmail)} disabled={!shareEmail.trim()}><Icon name="plus" size={14} /> Adicionar</button>
                </div>
              </div>
              {suggestedMembers.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)', marginBottom: 10 }}>Membros do time</div>
                  {suggestedMembers.map(m => (
                    <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)', marginBottom: 6 }}>
                      <Avatar name={m.name} size={28} color={m.color} />
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div><div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{m.email}</div></div>
                      <button className="btn btn-sm btn-secondary" onClick={() => addShare(m.email)}><Icon name="plus" size={12} /> Convidar</button>
                    </div>
                  ))}
                </div>
              )}
              {sharedWith.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tx-3)', marginBottom: 10 }}>Com acesso</div>
                  {sharedWith.map(email => {
                    const m = TEAM_MEMBERS.find(x => x.email === email)
                    return (
                      <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)', marginBottom: 6 }}>
                        <Avatar name={m?.name ?? email} size={28} color={m?.color ?? '#6366F1'} />
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{m?.name ?? email}</div><div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{email}</div></div>
                        <span style={{ fontSize: 11, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Acesso concedido</span>
                        <button className="icon-btn" onClick={() => removeShare(email)}><Icon name="x" size={13} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="link" size={16} style={{ color: 'var(--tx-3)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Link de acesso</div><div style={{ fontSize: 11, color: 'var(--tx-3)', fontFamily: 'monospace' }}>organizeragend.app/files/{current.id}</div></div>
                <button className="btn btn-sm btn-secondary" onClick={copyLink}>
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

function FileCard({ file, onClick }: { file: LocalFile; onClick: () => void }) {
  const fi = fileIcon(file.type)
  return (
    <div onClick={onClick}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, padding: '16px 16px 14px', cursor: 'pointer', transition: 'box-shadow 150ms, transform 150ms', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}
      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {file.isUploading && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <div style={{ textAlign: 'center' }}>
            <Icon name="loader" size={24} style={{ display: 'block', margin: '0 auto 8px', color: 'white' }} />
            <div style={{ fontSize: 12, color: 'white' }}>{file.uploadProgress ?? 0}%</div>
          </div>
        </div>
      )}
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${fi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={fi.icon} size={24} style={{ color: fi.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{file.name}</div>
        <div style={{ fontSize: 11, color: 'var(--tx-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: file.projColor }} />{file.proj}</span>
          <span>·</span><span>{file.size}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--tx-3)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={10} />{file.modifiedAt}</span>
        {file.sharedWith.length > 0 && (
          <div style={{ display: 'flex' }}>
            {file.sharedWith.slice(0, 3).map((email, i) => {
              const m = TEAM_MEMBERS.find(x => x.email === email)
              return <div key={email} style={{ marginLeft: i > 0 ? -6 : 0 }}><Avatar name={m?.name ?? email} size={18} color={m?.color ?? '#6366F1'} /></div>
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function FileRow({ file, onClick, onDelete }: { file: LocalFile; onClick: () => void; onDelete: (id: string) => void }) {
  const fi = fileIcon(file.type)
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px', borderBottom: '1px solid var(--bd-default)', cursor: 'pointer', transition: 'background 120ms' }}
      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'; (e.currentTarget as HTMLDivElement).querySelectorAll<HTMLElement>('.fa').forEach(b => (b.style.opacity = '1')) }}
      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).querySelectorAll<HTMLElement>('.fa').forEach(b => (b.style.opacity = '0')) }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${fi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={fi.icon} size={16} style={{ color: fi.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
        <div style={{ fontSize: 11, color: 'var(--tx-3)', display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: file.projColor }} />{file.proj}</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'var(--tx-3)', width: 70, textAlign: 'right' }}>{file.size}</span>
      <span style={{ fontSize: 12, color: 'var(--tx-3)', width: 100, textAlign: 'right' }}>{file.modifiedAt}</span>
      <div style={{ width: 60, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        {file.sharedWith.length > 0 && <span style={{ fontSize: 11, color: 'var(--tx-3)', display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="users" size={11} />{file.sharedWith.length}</span>}
      </div>
      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
        <button className="fa icon-btn" style={{ opacity: 0, transition: 'opacity 150ms', color: 'var(--c-danger)' }} onClick={() => onDelete(file.id)} title="Excluir"><Icon name="trash" size={13} /></button>
      </div>
    </div>
  )
}

export function Files() {
  const { user } = useApp()
  const [files,      setFiles]      = useState<LocalFile[]>([])
  const [layout,     setLayout]     = useState<ViewLayout>('grid')
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterProj, setFilterProj] = useState<string>('all')
  const [sortBy,     setSortBy]     = useState<'name' | 'date' | 'size'>('date')
  const [selected,   setSelected]   = useState<LocalFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    docsApi.list().then(data => setFiles(data.map(dtoToLocal))).catch(console.error)
  }, [userId])

  const uploadFile = async (name: string, size: number) => {
    const id = `uploading-${Date.now()}`
    const type = extToType(name)
    const sizeStr = size > 1024*1024 ? `${(size/1024/1024).toFixed(1)} MB` : `${Math.round(size/1024)} KB`
    const placeholder: LocalFile = { id, name, type, size: sizeStr, proj: 'Geral', projColor: '#6366F1', modifiedAt: 'agora', sharedWith: [], isUploading: true, uploadProgress: 0 }
    setFiles(prev => [placeholder, ...prev])
    // Simula progresso visual enquanto persiste no BD
    let progress = 0
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 30, 90)
      setFiles(prev => prev.map(f => f.id === id ? { ...f, uploadProgress: Math.round(progress) } : f))
    }, 200)
    try {
      const dto = await docsApi.create({ nome: name, tipo: type, tamanho: sizeStr })
      clearInterval(interval)
      setFiles(prev => prev.map(f => f.id === id ? { ...dtoToLocal(dto), isUploading: false } : f))
    } catch {
      clearInterval(interval)
      setFiles(prev => prev.filter(f => f.id !== id))
    }
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => { Array.from(e.target.files ?? []).forEach(f => uploadFile(f.name, f.size)); e.target.value = '' }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); Array.from(e.dataTransfer.files).forEach(f => uploadFile(f.name, f.size)) }
  const handleDelete = (id: string) => { setFiles(prev => prev.filter(f => f.id !== id)); docsApi.remove(id).catch(() => {}) }

  const filtered = files
    .filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterType !== 'all' && f.type !== filterType) return false
      if (filterProj !== 'all' && f.proj !== filterProj) return false
      return true
    })
    .sort((a, b) => { if (sortBy === 'name') return a.name.localeCompare(b.name); if (sortBy === 'size') return parseFloat(a.size) - parseFloat(b.size); return 0 })

  const projList  = [...new Set(files.map(f => f.proj))]
  const typeList  = [...new Set(files.map(f => f.type))]
  const totalSize = files.reduce((acc, f) => { const n = parseFloat(f.size); return acc + n * (f.size.includes('MB') ? 1 : 0.001) }, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false) }}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div style={{ position: 'absolute', inset: 220, zIndex: 100, background: 'rgba(99,102,241,0.15)', border: '2px dashed var(--c-primary)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: 'var(--c-primary)' }}>
              <Icon name="upload" size={40} style={{ display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>Solte para fazer upload</div>
            </div>
          </div>
        )}

        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Arquivos</h1>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-card)', color: 'var(--tx-2)', fontWeight: 600, border: '1px solid var(--bd-default)' }}>{files.length} arquivos</span>
          <div style={{ flex: 1 }} />
          <div style={{ width: 240, height: 34, background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
            <Icon name="search" size={13} style={{ color: 'var(--tx-3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar arquivo…" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--tx-1)', fontSize: 13, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setLayout(v)} style={{ width: 32, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', background: layout === v ? 'var(--bg-surface)' : 'transparent', color: layout === v ? 'var(--tx-1)' : 'var(--tx-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms', boxShadow: layout === v ? '0 1px 4px rgba(0,0,0,0.25)' : 'none' }} title={v === 'grid' ? 'Grade' : 'Lista'}>
                <Icon name={v === 'grid' ? 'layout-grid' : 'list'} size={15} />
              </button>
            ))}
          </div>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFilePick} />
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}><Icon name="upload" size={14} /> Upload</button>
        </header>

        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 24px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total de arquivos', value: files.length, color: 'var(--c-primary)', icon: 'files' },
              { label: 'Armazenamento', value: `${totalSize.toFixed(1)} MB`, color: '#10B981', icon: 'database' },
              { label: 'Compartilhados', value: files.filter(f => f.sharedWith.length > 0).length, color: '#6366F1', icon: 'users' },
              { label: 'Esta semana', value: files.filter(f => f.modifiedAt.includes('min') || f.modifiedAt.includes('hora') || f.modifiedAt === 'agora').length, color: '#F59E0B', icon: 'calendar-week' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={16} style={{ color: s.color }} />
                </div>
                <div><div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div><div style={{ fontSize: 11, color: 'var(--tx-3)', fontWeight: 500 }}>{s.label}</div></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterProj} onChange={e => setFilterProj(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
              <option value="all">Todos os projetos</option>{projList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
              <option value="all">Todos os tipos</option>{typeList.map(t => <option key={t} value={t}>.{t.toUpperCase()}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--tx-1)', outline: 'none', cursor: 'pointer' }}>
              <option value="date">Mais recentes</option><option value="name">Nome</option><option value="size">Tamanho</option>
            </select>
            <div style={{ flex: 1 }} />
            {(filterType !== 'all' || filterProj !== 'all' || search) && (
              <button onClick={() => { setFilterType('all'); setFilterProj('all'); setSearch('') }} style={{ background: 'none', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'var(--tx-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="x" size={12} /> Limpar filtros
              </button>
            )}
          </div>

          <div style={{ marginBottom: 20, padding: 16, border: '1.5px dashed var(--bd-default)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 150ms, background 150ms' }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={e => { (e.currentTarget.style.borderColor = 'var(--c-primary)'); (e.currentTarget.style.background = 'var(--c-primary-soft)') }}
            onMouseOut={e => { (e.currentTarget.style.borderColor = 'var(--bd-default)'); (e.currentTarget.style.background = 'transparent') }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--c-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="cloud-upload" size={22} style={{ color: 'var(--c-primary)' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Clique ou arraste arquivos aqui para fazer upload</div>
              <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>PDF, DOCX, XLSX, PNG, PPTX e mais — até 50 MB por arquivo</div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)', fontSize: 13 }}>
              <Icon name="files" size={36} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.4 }} />Nenhum arquivo encontrado
            </div>
          ) : layout === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {filtered.map(f => <FileCard key={f.id} file={f} onClick={() => setSelected(f)} />)}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderBottom: '1px solid var(--bd-default)', fontSize: 11, fontWeight: 600, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <div style={{ width: 32 }} /><div style={{ flex: 1 }}>Nome</div>
                <div style={{ width: 70, textAlign: 'right' }}>Tamanho</div>
                <div style={{ width: 100, textAlign: 'right' }}>Modificado</div>
                <div style={{ width: 60, textAlign: 'right' }}>Acesso</div>
                <div style={{ width: 30 }} />
              </div>
              {filtered.map(f => <FileRow key={f.id} file={f} onClick={() => setSelected(f)} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      </main>

      {selected && <FileModal file={selected} allFiles={filtered} onClose={() => setSelected(null)} onDelete={id => { handleDelete(id); setSelected(null) }} />}
    </div>
  )
}
