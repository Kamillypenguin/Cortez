import { useState } from 'react'
import { useApp } from '../../lib/context'
import { Icon, Sparkle } from '../../components/ui'

const PROFILES = [
  { id: 'estudante', label: 'Estudante', desc: 'Universidade, cursos e atividades' },
  { id: 'professor', label: 'Professor', desc: 'Aulas, turmas e materiais' },
  { id: 'profissional', label: 'Profissional', desc: 'Clientes, projetos e entregas' },
  { id: 'corporativo', label: 'Coordenador', desc: 'Equipes, sprints e relatórios' },
]

export function Login() {
  const { login, register } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [profile, setProfile] = useState('estudante')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, senha)
      } else {
        if (!nome.trim()) { setError('Nome é obrigatório'); setLoading(false); return }
        await register(nome, email, senha, profile)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--grad-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkle size={22} style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>OrganizerAgend</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--tx-3)' }}>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Tabs */}
              <div style={{ display: 'flex', background: 'var(--bg-base)', borderRadius: 8, padding: 3, marginBottom: 4 }}>
                {(['login', 'register'] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setMode(m); setError('') }}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600,
                      background: mode === m ? 'var(--bg-surface)' : 'transparent',
                      color: mode === m ? 'var(--tx-1)' : 'var(--tx-3)',
                      boxShadow: mode === m ? 'var(--sh-1)' : 'none',
                      transition: 'all 150ms',
                    }}>
                    {m === 'login' ? 'Entrar' : 'Cadastrar'}
                  </button>
                ))}
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Nome</label>
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo"
                    style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--tx-1)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--bd-default)')} />
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Perfil</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PROFILES.map(p => (
                      <button key={p.id} type="button" onClick={() => setProfile(p.id)}
                        style={{
                          padding: '10px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                          border: `1px solid ${profile === p.id ? 'var(--c-primary)' : 'var(--bd-default)'}`,
                          background: profile === p.id ? 'var(--c-primary-soft)' : 'var(--bg-card)',
                        }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: profile === p.id ? 'var(--c-primary)' : 'var(--tx-1)' }}>{p.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 2 }}>{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 13, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="alert-triangle" size={14} />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email || !senha}
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px 0', fontSize: 15, fontWeight: 600, justifyContent: 'center', marginTop: 4 }}>
                {loading
                  ? <><Icon name="loader" size={16} /> Aguarde...</>
                  : mode === 'login'
                    ? <><Icon name="login" size={16} /> Entrar</>
                    : <><Icon name="user-plus" size={16} /> Criar conta</>
                }
              </button>
            </div>
          </form>

          {/* Demo hint */}
          {mode === 'login' && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--bd-default)', fontSize: 12, color: 'var(--tx-3)', textAlign: 'center' }}>
              Demo: <code style={{ color: 'var(--c-primary)' }}>kamil@organizeragend.com</code> / <code style={{ color: 'var(--c-primary)' }}>Demo@123</code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
