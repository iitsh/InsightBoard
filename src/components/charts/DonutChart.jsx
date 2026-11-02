import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import ChartTooltip from './ChartTooltip'
import { fmtPercent } from '../../utils/format'

// 1re part : accent. Les suivantes : rampe de gris. "Autres" : le gris le plus discret.
const colorFor = (slice, i) => {
  if (slice.isOther) return 'var(--chart-5)'
  if (i === 0) return 'var(--accent)'
  return `var(--chart-${Math.min(i, 4)})`
}

export default function DonutChart({ slices }) {
  return (
    <div className="flex h-full items-center gap-8">
      <div className="h-full w-[170px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              stroke="var(--paper)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((s, i) => (
                <Cell key={s.name} fill={colorFor(s, i)} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="min-w-0 flex-1 text-[13px]">
        {slices.map((s, i) => (
          <li key={s.name} className="flex items-center gap-3 border-b border-rule py-2">
            <span className="h-2 w-2 shrink-0" style={{ background: colorFor(s, i) }} />
            <span className="truncate">{s.name}</span>
            <span className="ml-auto font-mono text-[12px] text-muted">{fmtPercent(s.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}