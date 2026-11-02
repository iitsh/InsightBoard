import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { tick, axisLine, grid } from './chartTheme'
import { fmtCompact } from '../../utils/format'

const shorten = (s) => (s.length > 18 ? s.slice(0, 17) + '…' : s)

export default function RankingChart({ rows }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} horizontal={false} />
        <XAxis type="number" tick={tick} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={tick}
          tickLine={false}
          axisLine={axisLine}
          tickFormatter={shorten}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--rule)', opacity: 0.5 }} />
        <Bar dataKey="value" maxBarSize={22} isAnimationActive={false}>
          {rows.map((row, i) => (
            <Cell key={row.name} fill={i === 0 ? 'var(--accent)' : 'var(--chart-2)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}