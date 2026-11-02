import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { tick, axisLine, grid } from './chartTheme'
import { fmtCompact } from '../../utils/format'

export default function TrendChart({ points }) {
  const last = points[points.length - 1]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={axisLine} minTickGap={32} />
        <YAxis tick={tick} tickLine={false} axisLine={false} width={44} tickFormatter={fmtCompact} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--muted)', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--ink)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'none' }}
          isAnimationActive={false}
        />
        {/* L'unique touche d'accent : la dernière valeur */}
        <ReferenceDot x={last.label} y={last.value} r={4} fill="var(--accent)" stroke="none" />
      </LineChart>
    </ResponsiveContainer>
  )
}