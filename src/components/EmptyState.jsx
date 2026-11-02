import { useRef, useState } from 'react'
import { useDataStore } from '../store/useDataStore'
import { generateSampleData } from '../utils/sampleData'

export default function EmptyState() {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const importFile = useDataStore((s) => s.importFile)
  const setDataset = useDataStore((s) => s.setDataset)

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    importFile(e.dataTransfer.files[0])
  }

  return (
    <section className="grid grid-cols-12 gap-x-8 px-8 pt-24">
      {/* Colonne gauche : le propos */}
      <div className="col-span-12 lg:col-span-7">
        <p className="eyebrow">00 — Source de données</p>
        <h1 className="mt-8 font-serif text-6xl leading-[0.95] tracking-tight lg:text-[88px]">
          Déposez un fichier.
          <br />
          Lisez vos <em>données</em>.
        </h1>
        <p className="mt-8 max-w-md text-[15px] leading-relaxed text-muted">
          Importez un CSV ou un classeur Excel. Tout est traité dans votre navigateur :
          aucune donnée ne quitte votre ordinateur.
        </p>
      </div>

      {/* Colonne droite : la zone d'import, décalée vers le bas volontairement */}
      <div className="col-span-12 mt-16 lg:col-span-5 lg:mt-40">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex h-64 flex-col justify-between border p-7 transition-colors duration-150 ${
            dragging ? 'border-accent' : 'border-rule'
          }`}
        >
          <p className="eyebrow">Formats acceptés — .csv · .xlsx · .xls</p>

          <div>
            <button
              onClick={() => inputRef.current.click()}
              className="border border-ink px-4 py-2 text-[13px] transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              Choisir un fichier
            </button>
            <span className="ml-4 text-[13px] text-muted">ou glissez-le ici</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              importFile(e.target.files[0])
              e.target.value = ''
            }}
            className="hidden"
          />
        </div>

        <button
          onClick={() => setDataset('ventes_exemple.csv', generateSampleData(400))}
          className="mt-5 text-[13px] text-muted underline underline-offset-4 transition-colors duration-150 hover:text-ink"
        >
          Charger un jeu d'exemple (400 lignes de ventes)
        </button>
      </div>
    </section>
  )
}