import { AppProvider, useApp } from './lib/context'
import { Onboarding } from './pages/onboarding/Onboarding'
import { Login } from './pages/login/Login'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Tasks } from './pages/tasks/Tasks'
import { Agenda } from './pages/agenda/Agenda'
import { Files } from './pages/files/Files'
import { Collab } from './pages/collab/Collab'
import { AIAssistant } from './pages/ai/AIAssistant'
import { StatusReport } from './pages/statusreport/StatusReport'
import { MindMap } from './pages/mindmap/MindMap'
import { Icon } from './components/ui'

function AppContent() {
  const { profile, page, token, authLoading } = useApp()

  // Aguarda verificar sessão salva
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--tx-3)' }}>
          <Icon name="loader" size={32} style={{ display: 'block', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 14 }}>Carregando...</div>
        </div>
      </div>
    )
  }

  // Não autenticado → Login
  if (!token) return <Login />

  // Autenticado mas sem perfil → Onboarding
  if (!profile) return <Onboarding onComplete={() => {}} />

  switch (page) {
    case 'agenda':       return <Agenda />
    case 'tasks':        return <Tasks />
    case 'files':        return <Files />
    case 'ai':           return <AIAssistant />
    case 'collab':       return <Collab />
    case 'statusreport': return <StatusReport />
    case 'mindmap':      return <MindMap />
    default:             return <Dashboard />
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
