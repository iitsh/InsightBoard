import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { tick, axisLine, grid } from './chartTheme'
import { fmtCompact } from '../../utils/format'

export default function CumulativeChart({ points }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={axisLine} minTickGap={40} />
        <YAxis tick={tick} tickLine={false} axisLine={false} width={44} tickFormatter={fmtCompact} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--muted)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="cumul"
          stroke="var(--ink)"
          strokeWidth={1.5}
          fill="var(--chart-5)"
          fillOpacity={1}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}