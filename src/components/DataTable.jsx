import { useState } from 'react'
import { useDataStore } from '../store/useDataStore'
import { fmtNumber, fmtInt } from '../utils/format'

const formatCell = (v) => {
  if (v === null || v === undefined || v === '') return '—'
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'number') {
    // Une année (2024) ne doit pas devenir "2 024"
    if (Number.isInteger(v) && v >= 1900 && v <= 2100) return String(v)
    return fmtNumber(v)
  }
  return String(v)
}

export default function DataTable({ profile }) {
  const { data, columns } = useDataStore()
  const [visible, setVisible] = useState(10)
  const numeric = new Set(profile.filter((c) => c.type === 'number').map((c) => c.name))
  const rows = data.slice(0, visible)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-ink">
            {columns.map((col) => (
              <th
                key={col}
                className={`eyebrow py-3 pr-6 font-medium ${numeric.has(col) ? 'text-right' : 'text-left'}`}
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
                  className={`py-2.5 pr-6 ${numeric.has(col) ? 'text-right font-mono' : 'text-left'}`}
                >
                  {formatCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-6 font-mono text-[11px] text-muted">
        <span>
          {fmtInt(rows.length)} lignes affichées sur {fmtInt(data.length)}
        </span>
        {visible < data.length && (
          <button
            onClick={() => setVisible((v) => v + 25)}
            className="underline underline-offset-4 transition-colors duration-150 hover:text-ink"
          >
            Afficher 25 lignes de plus
          </button>
        )}
      </div>
    </div>
  )
}