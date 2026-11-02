import { fmtNumber, fmtPercent } from '../../utils/format'

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const share = item.payload?.share

  return (
    <div className="border border-ink bg-paper px-3 py-2 font-mono">
      <p className="eyebrow">{label ?? item.name}</p>
      <p className="mt-1 text-[13px] text-ink">
        {fmtNumber(item.value)}
        {share != null && <span className="text-muted"> · {fmtPercent(share)}</span>}
      </p>
    </div>
  )
}