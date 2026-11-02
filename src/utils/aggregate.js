const round2 = (n) => Math.round(n * 100) / 100
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

// Convertit une valeur en Date (objet Date Excel, "2024-03-15" ou "15/03/2024")
export function toDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v !== 'string') return null
  const s = v.trim()
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(+m[1], +m[2] - 1, +m[3])
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return new Date(+m[3], +m[2] - 1, +m[1])
  return null
}

export function computeStats(data, measure) {
  let total = 0
  let count = 0
  let max = -Infinity
  for (const row of data) {
    const v = row[measure]
    if (!isNum(v)) continue
    total += v
    count++
    if (v > max) max = v
  }
  return { total: round2(total), count, avg: count ? total / count : 0, max: count ? max : 0 }
}

// Somme de la mesure pour chaque valeur de la dimension, triée du plus grand au plus petit
export function groupByDimension(data, dimension, measure) {
  const map = new Map()
  for (const row of data) {
    const v = row[measure]
    if (!isNum(v)) continue
    const raw = row[dimension]
    const name = raw === null || raw === undefined || raw === '' ? '(vide)' : String(raw)
    map.set(name, (map.get(name) ?? 0) + v)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round2(value) }))
    .sort((a, b) => b.value - a.value)
}

// Garde les n premiers et regroupe le reste dans "Autres" (pour le donut)
export function topWithOthers(rows, n = 5) {
  const total = rows.reduce((s, r) => s + r.value, 0)
  const head = rows.slice(0, n)
  const rest = rows.slice(n)
  if (rest.length > 0) {
    head.push({ name: 'Autres', value: round2(rest.reduce((s, r) => s + r.value, 0)), isOther: true })
  }
  return head.map((r) => ({ ...r, share: total > 0 ? r.value / total : 0 }))
}

// Somme par jour (si la période est courte) ou par mois, avec le cumul
export function groupByTime(data, dateColumn, measure) {
  const points = []
  for (const row of data) {
    const d = toDate(row[dateColumn])
    const v = row[measure]
    if (d && isNum(v)) points.push([d, v])
  }
  if (points.length === 0) return { granularity: 'month', points: [] }

  let min = Infinity
  let max = -Infinity
  for (const [d] of points) {
    const t = d.getTime()
    if (t < min) min = t
    if (t > max) max = t
  }
  const granularity = (max - min) / 86400000 <= 62 ? 'day' : 'month'

  const pad = (n) => String(n).padStart(2, '0')
  const buckets = new Map()
  for (const [d, v] of points) {
    const key =
      granularity === 'day'
        ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        : `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
    buckets.set(key, (buckets.get(key) ?? 0) + v)
  }

  let cumul = 0
  const series = [...buckets.keys()].sort().map((key) => {
    const [y, m, day] = key.split('-').map(Number)
    const date = new Date(y, m - 1, day || 1)
    const value = round2(buckets.get(key))
    cumul = round2(cumul + value)
    const label =
      granularity === 'day'
        ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    return { key, label, value, cumul }
  })

  return { granularity, points: series }
}