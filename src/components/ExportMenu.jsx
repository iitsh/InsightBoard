import { useState } from 'react'
import { useDataStore } from '../store/useDataStore'
import { exportPng, exportPdf } from '../utils/exportDashboard'

const BTN =
  'h-8 px-3 border border-rule text-xs text-ink transition-colors duration-150 ' +
  'hover:border-accent hover:text-accent ' +
  'disabled:cursor-not-allowed disabled:text-muted disabled:hover:border-rule'

export default function ExportMenu() {
  const hasData = useDataStore((s) => Array.isArray(s.data) && s.data.length > 0)
  const fileName = useDataStore((s) => s.fileName)
  const [busy, setBusy] = useState(null) // 'png' | 'pdf' | null
  const [error, setError] = useState(null)

  // Pas de fichier chargé : rien à exporter, on n'affiche rien
  if (!hasData) return null

  async function run(kind) {
    setError(null)
    setBusy(kind)
    try {
      // Laisse React afficher « En cours… » avant le calcul lourd
      await new Promise((r) => setTimeout(r, 50))
      if (kind === 'png') {
        await exportPng(fileName)
      } else {
        await exportPdf(fileName)
      }
    } catch (e) {
      console.error(e)
      setError("Échec de l'export")
    } finally {
      setBusy(null)
    }
  }

  const disabled = busy !== null

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-accent">{error}</span>}
      <span className="eyebrow mr-1">Exporter</span>
      <button className={BTN} disabled={disabled} onClick={() => run('png')}>
        {busy === 'png' ? 'En cours…' : 'PNG'}
      </button>
      <button className={BTN} disabled={disabled} onClick={() => run('pdf')}>
        {busy === 'pdf' ? 'En cours…' : 'PDF'}
      </button>
    </div>
  )
}