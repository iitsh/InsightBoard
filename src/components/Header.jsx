import { useRef } from 'react'
import { useDataStore } from '../store/useDataStore'
import { useThemeStore } from '../store/useThemeStore'

export default function Header() {
  const inputRef = useRef(null)
  const importFile = useDataStore((s) => s.importFile)
  const hasData = useDataStore((s) => s.data.length > 0)
  const { theme, toggle } = useThemeStore()

  const onChange = (e) => {
    importFile(e.target.files[0])
    e.target.value = '' // permet de ré-importer le même fichier
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-rule px-8">
      <div className="flex items-center gap-3">
        <span className="block h-3 w-3 bg-ink" />
        <span className="font-serif text-[22px] leading-none tracking-tight">InsightBoard</span>
      </div>

      <div className="flex items-center gap-7 text-[13px]">
        <button
          onClick={toggle}
          className="text-muted transition-colors duration-150 hover:text-ink"
        >
          {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        </button>

        <button
          onClick={() => inputRef.current.click()}
          className="border border-ink px-3.5 py-1.5 transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          {hasData ? 'Remplacer les données' : 'Importer'} ↓
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </header>
  )
}