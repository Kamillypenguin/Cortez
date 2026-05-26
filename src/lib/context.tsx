import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

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
  const [profile, setProfileState] = useState<Profile>(
    () => (localStorage.getItem('profile') as Profile) || null
  )
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark'
  )
  const [page, setPage] = useState('home')

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

  const profileColor = profile ? PROFILE_COLORS[profile] : '#6366F1'
  const profileLabel = profile ? profileMeta[profile].label : ''
  const taskLabel = profile ? profileMeta[profile].task : 'Tarefas'
  const projectLabel = profile ? profileMeta[profile].project : 'Projetos'

  return (
    <AppContext.Provider value={{
      profile, setProfile, theme, toggleTheme,
      profileColor, profileLabel, taskLabel, projectLabel,
      page, setPage,
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
