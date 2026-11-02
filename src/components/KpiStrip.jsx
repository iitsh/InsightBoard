import { fmtInt, fmtNumber, fmtPercent } from '../utils/format'

function Kpi({ label, value, note, text = false }) {
  return (
    <div className="border-l border-rule pl-6">
      <p className="eyebrow">{label}</p>
      <p
        className={`mt-4 break-words font-serif leading-[1.05] tracking-tight ${
          text ? 'text-[30px]' : 'text-[44px]'
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-2 font-mono text-[11px] text-muted">{note}</p>}
    </div>
  )
}

export default function KpiStrip({ measure, agg, stats, ranking, dimension, points }) {
  const isAvg = agg === 'avg'

  // 1. Le chiffre principal : total ou moyenne
  const main = fmtNumber(isAvg ? stats.avg : stats.total)
  const bigSize = main.length > 9 ? 'text-5xl lg:text-[64px]' : 'text-6xl lg:text-[88px]'

  // 2. Variation entre les deux dernières périodes
  const last = points?.[points.length - 1]
  const prev = points?.[points.length - 2]
  const variation = last && prev && prev.value !== 0 ? (last.value - prev.value) / Math.abs(prev.value) : null

  // 3. Valeur en tête de la dimension
  const top = ranking?.[0]
  const topNote = isAvg
    ? `${fmtNumber(top?.value ?? 0)} en moyenne`
    : stats.total > 0 && top
      ? `${fmtPercent(top.value / stats.total)} du total`
      : undefined

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-10">
      <div className="col-span-12 lg:col-span-5">
        <p className="eyebrow">
          {isAvg ? 'Moyenne' : 'Total'} — {measure}
        </p>
        <p className={`mt-4 font-serif leading-none tracking-tight ${bigSize}`}>{main}</p>
        <p className="mt-3 font-mono text-[11px] text-muted">sur {fmtInt(stats.count)} valeurs</p>
      </div>

      <div className="col-span-12 grid grid-cols-1 gap-y-8 sm:grid-cols-3 lg:col-span-7">
        {isAvg ? (
          <Kpi label="Valeur maximale" value={fmtNumber(stats.max)} note={`sur ${fmtInt(stats.count)} lignes`} />
        ) : (
          <Kpi label="Moyenne par ligne" value={fmtNumber(stats.avg)} note={`max. ${fmtNumber(stats.max)}`} />
        )}

        {top ? (
          <Kpi label={`Premier — ${dimension}`} value={top.name} text note={topNote} />
        ) : (
          <Kpi label="Valeur maximale" value={fmtNumber(stats.max)} />
        )}

        {variation !== null ? (
          <Kpi label="Variation" value={fmtPercent(variation, true)} note={`${last.label} vs ${prev.label}`} />
        ) : (
          <Kpi label="Lignes exploitées" value={fmtInt(stats.count)} />
        )}
      </div>
    </div>
  )
}