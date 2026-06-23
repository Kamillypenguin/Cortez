import { useState, useEffect } from 'react'
import { useApp } from '../../lib/context'
import { Logo, NavItem, Icon, Avatar } from '../ui'
import { projetos as projetosApi, type ProjetoDTO } from '../../services/api'

export function Sidebar() {
  const { profileLabel, profileColor, theme, toggleTheme, page, setPage, user, logout } = useApp()
  const [projetosList, setProjetosList] = useState<ProjetoDTO[]>([])
  const [showAddProjeto, setShowAddProjeto] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newCor, setNewCor] = useState('#6366F1')
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    projetosApi.list().then(setProjetosList).catch(() => {})
  }, [userId])

  async function handleCreate() {
    const nome = newNome.trim()
    if (!nome) return
    try {
      const novo = await projetosApi.create({ nome, cor: newCor })
      setProjetosList(prev => [novo, ...prev])
      setNewNome('')
      setShowAddProjeto(false)
    } catch { /* silencioso */ }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Excluir projeto? Suas tarefas serão desvinculadas.')) return
    try {
      await projetosApi.remove(id)
      setProjetosList(prev => prev.filter(p => p.id !== id))
    } catch { /* silencioso */ }
  }

  const CORES = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899']

  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--bd-default)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 6px 20px' }}>
        <Logo size={26} />
      </div>

      {/* User card */}
      <div style={{
        padding: 10, background: 'var(--bg-card)', borderRadius: 10,
        marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Avatar name={user?.nome ?? 'U'} size={32} color={profileColor} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.nome ?? 'Usuário'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx-2)', marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: profileColor, flexShrink: 0 }} />
            {profileLabel}
          </div>
        </div>
        <button onClick={logout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 2, display: 'flex', alignItems: 'center' }}>
          <Icon name="logout" size={13} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
        <NavItem icon="home"      label="Início"        active={page === 'home'}         onClick={() => setPage('home')} />
        <NavItem icon="calendar"  label="Agenda"        active={page === 'agenda'}       onClick={() => setPage('agenda')} badge="3" />
        <NavItem icon="checklist" label="Tarefas"       active={page === 'tasks'}        onClick={() => setPage('tasks')} />
        <NavItem icon="folder"    label="Arquivos"      active={page === 'files'}        onClick={() => setPage('files')} />
        <NavItem icon="brain"     label="Mapas Mentais" active={page === 'mindmap'}      onClick={() => setPage('mindmap')} color="#10B981" />
        <NavItem icon="sparkles"  label="IA"            active={page === 'ai'}           onClick={() => setPage('ai')} color="#8B5CF6" />
        <NavItem icon="users"     label="Colaboração"   active={page === 'collab'}       onClick={() => setPage('collab')} />
        <NavItem icon="chart-bar" label="Relatórios"    active={page === 'statusreport'} onClick={() => setPage('statusreport')} />
      </nav>

      {/* Projetos recentes */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }} className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: 8 }}>
          <span className="t-micro" style={{ color: 'var(--tx-3)' }}>Projetos recentes</span>
          <button
            onClick={() => setShowAddProjeto(v => !v)}
            title="Novo projeto"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: 2, display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'color 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--tx-1)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--tx-3)')}
          >
            <Icon name="plus" size={13} />
          </button>
        </div>

        {/* Form: novo projeto */}
        {showAddProjeto && (
          <div style={{ margin: '0 0 10px', padding: 10, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--bd-default)' }}>
            <input
              autoFocus
              value={newNome}
              onChange={e => setNewNome(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowAddProjeto(false) }}
              placeholder="Nome do projeto"
              style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bd-default)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--tx-1)', marginBottom: 8, boxSizing: 'border-box', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
              {CORES.map(c => (
                <button key={c} onClick={() => setNewCor(c)}
                  style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: `2px solid ${newCor === c ? 'white' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0 }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }} onClick={handleCreate}>Criar</button>
              <button className="btn btn-sm btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }} onClick={() => setShowAddProjeto(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {projetosList.length === 0 && !showAddProjeto && (
          <div style={{ padding: '6px 8px', fontSize: 11, color: 'var(--tx-3)' }}>Nenhum projeto ainda</div>
        )}

        {projetosList.map(p => (
          <div key={p.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { const b = e.currentTarget.querySelector<HTMLElement>('.del-btn'); if (b) b.style.opacity = '1' }}
            onMouseLeave={e => { const b = e.currentTarget.querySelector<HTMLElement>('.del-btn'); if (b) b.style.opacity = '0' }}
          >
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8, flex: 1,
              background: 'transparent', border: 'none', padding: '6px 8px', borderRadius: 6,
              color: 'var(--tx-2)', cursor: 'pointer', fontSize: 12, textAlign: 'left',
            }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.cor, flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{p.nome}</span>
              {(p._count?.tarefas ?? 0) > 0 && (
                <span style={{ fontSize: 10, color: 'var(--tx-3)', flexShrink: 0, background: 'var(--bg-base)', borderRadius: 99, padding: '1px 5px' }}>
                  {p._count!.tarefas}
                </span>
              )}
            </button>
            <button className="del-btn" onClick={e => handleDelete(p.id, e)} title="Excluir projeto"
              style={{ opacity: 0, transition: 'opacity 0.15s', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px 6px', display: 'flex', alignItems: 'center', borderRadius: 4, flexShrink: 0 }}>
              <Icon name="trash" size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bd-default)' }}>
        <button className="btn btn-primary" style={{ flex: 1, height: 36, justifyContent: 'center' }}>
          <Icon name="plus" size={14} /> Novo
        </button>
        <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
      </div>
    </aside>
  )
}
