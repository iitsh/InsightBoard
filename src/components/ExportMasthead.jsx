import { fmtInt } from '../utils/format'

// Visible uniquement dans l'export (affiché par onclone dans exportDashboard.js).
// Si ta classe de titre serif n'est pas `font-serif`, remplace-la ici.
export default function ExportMasthead({ fileName, shown, total, filters }) {
  const title = (fileName || 'Dashboard').replace(/\.[^.]+$/, '')
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      data-export-only
      style={{ display: 'none' }}
      className="mb-8 border-t-2 border-ink pt-4"
    >
      <div className="flex items-end justify-between gap-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-3 w-3 bg-ink" />
            <span className="eyebrow">InsightBoard — Rapport</span>
          </div>
          <h1 className="font-serif text-5xl leading-none text-ink">{title}</h1>
        </div>
        <div className="text-right font-mono text-[11px] leading-relaxed text-muted">
          <div>{date}</div>
          <div>
            {fmtInt(shown)} / {fmtInt(total)} lignes
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-rule pt-3 text-xs text-muted">
        <span className="eyebrow mr-3">Filtres</span>
        {filters.length ? filters.join('   ·   ') : 'Aucun'}
      </p>
    </div>
  )
}