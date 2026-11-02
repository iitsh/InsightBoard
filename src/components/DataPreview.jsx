import { useDataStore } from '../store/useDataStore'

const formatCell = (v) => {
  if (v === null || v === undefined || v === '') return '—'
  if (v instanceof Date) return v.toISOString().slice(0, 10) // dates Excel
  if (typeof v === 'number') return v.toLocaleString('fr-FR')
  return String(v)
}

export default function DataPreview() {
  const { data, columns, reset } = useDataStore()
  const rows = data.slice(0, 10)

  // Une colonne est "numérique" si toutes ses valeurs (échantillon) sont des nombres
  const isNumeric = (col) => {
    const sample = data.slice(0, 50).map((r) => r[col]).filter((v) => v != null)
    return sample.length > 0 && sample.every((v) => typeof v === 'number')
  }

  return (
    <section className="grid grid-cols-12 gap-x-8 px-8 pt-14">
      {/* Colonne gauche : les chiffres clés du fichier */}
      <aside className="col-span-12 lg:col-span-3">
        <p className="eyebrow">01 — Aperçu</p>
        <p className="mt-6 font-serif text-[88px] leading-none tracking-tight">
          {data.length.toLocaleString('fr-FR')}
        </p>
        <p className="eyebrow mt-2">lignes</p>

        <p className="mt-8 font-serif text-5xl leading-none">{columns.length}</p>
        <p className="eyebrow mt-2">colonnes</p>

        <button
          onClick={reset}
          className="mt-10 text-[13px] text-muted underline underline-offset-4 transition-colors duration-150 hover:text-accent"
        >
          Réinitialiser
        </button>
      </aside>

      {/* Colonne droite : le tableau */}
      <div className="col-span-12 mt-10 overflow-x-auto lg:col-span-9 lg:mt-0">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-ink">
              {columns.map((col) => (
                <th
                  key={col}
                  className={`eyebrow py-3 pr-6 font-medium ${isNumeric(col) ? 'text-right' : 'text-left'}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-rule">
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`py-2.5 pr-6 ${
                      isNumeric(col) ? 'text-right font-mono' : 'text-left'
                    }`}
                  >
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 font-mono text-[11px] text-muted">
          10 premières lignes sur {data.length.toLocaleString('fr-FR')}
        </p>
      </div>
    </section>
  )
}