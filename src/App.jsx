import { useEffect } from 'react'
import { useDataStore } from './store/useDataStore'
import { useThemeStore } from './store/useThemeStore'
import Header from './components/Header'
import StatusBar from './components/StatusBar'
import EmptyState from './components/EmptyState'
import Dashboard from './components/Dashboard'

export default function App() {
  const theme = useThemeStore((s) => s.theme)
  const hasData = useDataStore((s) => s.data.length > 0)
  const loadedAt = useDataStore((s) => s.loadedAt)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased">
      <Header />
      <main className="pb-20">
        {/* La key remet à zéro les sélecteurs quand on charge un nouveau fichier */}
        {hasData ? <Dashboard key={loadedAt?.getTime()} /> : <EmptyState />}
      </main>
      <StatusBar />
    </div>
  )
}