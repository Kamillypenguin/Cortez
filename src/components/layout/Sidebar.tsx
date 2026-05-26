import { useApp } from '../../lib/context'
import { Logo, NavItem, Icon, StatusDot, Avatar } from '../ui'

const projects = [
  { name: 'TCC · Visão Computacional', status: 'warn' as const },
  { name: 'Disciplina · Estatística', status: 'ok' as const },
  { name: 'Iniciação Científica', status: 'ok' as const },
  { name: 'Monografia parcial', status: 'bad' as const },
  { name: 'Grupo de Estudos', status: 'paused' as const },
]

interface SidebarProps {
  active: string
  onNav: (id: string) => void
}

export function Sidebar({ active, onNav }: SidebarProps) {
  const { profileLabel, profileColor, theme, toggleTheme } = useApp()

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
        <Avatar name="Kamil" size={32} color={profileColor} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Kamil
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx-2)', marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: profileColor, flexShrink: 0 }} />
            {profileLabel}
          </div>
        </div>
        <Icon name="selector" size={14} style={{ color: 'var(--tx-3)' }} />
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
        <NavItem icon="home" label="Início" active={active === 'home'} onClick={() => onNav('home')} />
        <NavItem icon="calendar" label="Agenda" active={active === 'agenda'} onClick={() => onNav('agenda')} badge="3" />
        <NavItem icon="checklist" label="Tarefas" active={active === 'tasks'} onClick={() => onNav('tasks')} />
        <NavItem icon="folder" label="Arquivos" active={active === 'files'} onClick={() => onNav('files')} />
        <NavItem icon="sparkles" label="IA" active={active === 'ai'} onClick={() => onNav('ai')} color="#8B5CF6" />
        <NavItem icon="users" label="Colaboração" active={active === 'collab'} onClick={() => onNav('collab')} />
      </nav>

      {/* Projects */}
      <div style={{ flex: 1, overflow: 'auto' }} className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: 8 }}>
          <span className="t-micro" style={{ color: 'var(--tx-3)' }}>Projetos recentes</span>
          <Icon name="plus" size={12} style={{ color: 'var(--tx-3)', cursor: 'pointer' }} />
        </div>
        {projects.map(p => (
          <button key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            background: 'transparent', border: 'none', padding: '6px 8px', borderRadius: 6,
            color: 'var(--tx-2)', cursor: 'pointer', fontSize: 12, textAlign: 'left',
          }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-card)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <StatusDot status={p.status} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{p.name}</span>
          </button>
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
