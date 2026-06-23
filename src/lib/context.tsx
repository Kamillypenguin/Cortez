import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { auth as authApi } from '../services/api'
import type { UserDTO } from '../services/api'

export type Profile = 'estudante' | 'professor' | 'profissional' | 'corporativo' | null
export type Theme = 'dark' | 'light'

interface AppContextType {
  profile: Profile
  setProfile: (p: Profile) => void
  theme: Theme
  toggleTheme: () => void
  profileColor: string
  profileLabel: string
  taskLabel: string
  projectLabel: string
  page: string
  setPage: (p: string) => void
  // Auth
  user: UserDTO | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string, profile: string) => Promise<void>
  logout: () => void
  authLoading: boolean
}

export const PROFILE_COLORS: Record<string, string> = {
  estudante: '#6366F1',
  professor: '#10B981',
  profissional: '#F59E0B',
  corporativo: '#3B82F6',
}

const profileMeta: Record<string, { label: string; task: string; project: string }> = {
  estudante: { label: 'Estudante', task: 'Atividades', project: 'Disciplinas' },
  professor: { label: 'Professor', task: 'Aulas', project: 'Turmas' },
  profissional: { label: 'Profissional', task: 'Entregas', project: 'Clientes' },
  corporativo: { label: 'Coordenador', task: 'Tarefas', project: 'Projetos' },
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const VALID_PROFILES = ['estudante', 'professor', 'profissional', 'corporativo']

  const [profile, setProfileState] = useState<Profile>(() => {
    const saved = localStorage.getItem('profile')
    return saved && VALID_PROFILES.includes(saved) ? (saved as Profile) : null
  })
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark'
  )
  const [page, setPage] = useState('home')
  const [user, setUser] = useState<UserDTO | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [authLoading, setAuthLoading] = useState(true)

  // Restaura sessão ao montar
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedRefresh = localStorage.getItem('refreshToken')

    if (!savedToken) { setAuthLoading(false); return }

    authApi.me()
      .then(({ user: u }) => {
        setUser(u)
        setToken(savedToken)
        // O cargo pode ser usado como profile no futuro
      })
      .catch(async () => {
        // Access token expirou — tenta renovar com refresh token
        if (savedRefresh) {
          try {
            const tokens = await authApi.refresh(savedRefresh)
            localStorage.setItem('token', tokens.accessToken)
            localStorage.setItem('refreshToken', tokens.refreshToken)
            setToken(tokens.accessToken)
            const { user: u } = await authApi.me()
            setUser(u)
          } catch {
            // Refresh também inválido — limpa sessão
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            setToken(null)
            setUser(null)
          }
        } else {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => setAuthLoading(false))
  }, [])

  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : ''
  }, [theme])

  const setProfile = (p: Profile) => {
    setProfileState(p)
    if (p) localStorage.setItem('profile', p)
  }

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }

  const login = async (email: string, senha: string) => {
    const res = await authApi.login({ email, senha })
    localStorage.setItem('token', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    setToken(res.accessToken)
    setUser(res.user)
    // Define profile padrão se não tiver
    if (!localStorage.getItem('profile')) {
      setProfileState('estudante')
      localStorage.setItem('profile', 'estudante')
    }
  }

  const register = async (nome: string, email: string, senha: string, prof: string) => {
    const res = await authApi.register({ nome, email, senha })
    localStorage.setItem('token', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    setToken(res.accessToken)
    setUser(res.user)
    if (VALID_PROFILES.includes(prof)) {
      setProfileState(prof as Profile)
      localStorage.setItem('profile', prof)
    }
  }

  const logout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('profile')
    setToken(null)
    setUser(null)
    setProfileState(null)
    setPage('home')
  }

  const profileColor = profile ? PROFILE_COLORS[profile] : '#6366F1'
  const profileLabel = profile ? profileMeta[profile].label : ''
  const taskLabel = profile ? profileMeta[profile].task : 'Tarefas'
  const projectLabel = profile ? profileMeta[profile].project : 'Projetos'

  return (
    <AppContext.Provider value={{
      profile, setProfile, theme, toggleTheme,
      profileColor, profileLabel, taskLabel, projectLabel,
      page, setPage,
      user, token, login, register, logout, authLoading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
