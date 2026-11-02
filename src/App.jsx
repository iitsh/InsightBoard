import { useEffect } from 'react'
import { useDataStore } from './store/useDataStore'
import { useThemeStore } from './store/useThemeStore'
import Header from './components/Header'
import StatusBar from './components/StatusBar'
import EmptyState from './components/EmptyState'
import DataPreview from './components/DataPreview'

export default function App() {
  const theme = useThemeStore((s) => s.theme)
  const hasData = useDataStore((s) => s.data.length > 0)

  // Applique la classe .dark sur <html> quand le thème change
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased">
      <Header />
      <main className="pb-20">{hasData ? <DataPreview /> : <EmptyState />}</main>
      <StatusBar />
    </div>
  )
}