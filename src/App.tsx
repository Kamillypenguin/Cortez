import { AppProvider, useApp } from './lib/context'
import { Onboarding } from './pages/onboarding/Onboarding'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Tasks } from './pages/tasks/Tasks'
import { AIAssistant } from './pages/ai/AIAssistant'
import { StatusReport } from './pages/statusreport/StatusReport'

function AppContent() {
  const { profile, page } = useApp()

  if (!profile) {
    return <Onboarding onComplete={() => {}} />
  }

  if (page === 'tasks') return <Tasks />
  if (page === 'ai') return <AIAssistant />
  if (page === 'statusreport') return <StatusReport />

  return <Dashboard />
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
