import { useDataStore } from '../store/useDataStore'

export default function StatusBar() {
  const { fileName, data, columns, loadedAt, loading, error } = useDataStore()
  const fmt = (n) => n.toLocaleString('fr-FR')
  const time = loadedAt?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <footer className="fixed inset-x-0 bottom-0 flex h-7 items-center justify-between border-t border-rule bg-paper px-8 font-mono text-[11px] text-muted">
      <div className="flex gap-5">
        {error ? (
          <span className="text-accent">{error}</span>
        ) : loading ? (
          <span>Lecture du fichier…</span>
        ) : fileName ? (
          <>
            <span className="text-ink">{fileName}</span>
            <span>{fmt(data.length)} lignes</span>
            <span>{columns.length} colonnes</span>
            <span>chargé à {time}</span>
          </>
        ) : (
          <span>Aucun fichier</span>
        )}
      </div>
      <span>v0.1</span>
    </footer>
  )
}