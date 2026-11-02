const round2 = (n) => Math.round(n * 100) / 100
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const pad = (n) => String(n).padStart(2, '0')

// Libellé d'une valeur de catégorie (partagé avec les filtres)
export const labelOf = (raw) =>
  raw === null || raw === undefined || raw === '' ? '(vide)' : String(raw)

// "2024-03-15" en heure locale (toISOString décalerait selon le fuseau)
export const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Convertit une valeur en Date (objet Date Excel, "2024-03-15", "15/03/2024" ou "11/8/2016")
export function toDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v !== 'string') return null
  const s = v.trim()
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(+m[1], +m[2] - 1, +m[3])
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) {
    const a = +m[1]
    const b = +m[2]
    // Si le 1er nombre dépasse 12, c'est forcément le jour (JJ/MM/AAAA).
    // Sinon on suppose le format américain (MM/JJ/AAAA).
    return a > 12 ? new Date(+m[3], b - 1, a) : new Date(+m[3], a - 1, b)
  }
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

// mode : 'sum' (somme), 'avg' (moyenne) ou 'count' (nombre de lignes)
// Équivalent SQL : SELECT dimension, SUM|AVG|COUNT(mesure) ... GROUP BY dimension ORDER BY ... DESC
export function groupByDimension(data, dimension, measure, mode = 'sum') {
  const map = new Map()
  for (const row of data) {
    const v = row[measure]
    if (!isNum(v)) continue
    const name = labelOf(row[dimension])
    const entry = map.get(name) ?? { sum: 0, count: 0 }
    entry.sum += v
    entry.count++
    map.set(name, entry)
  }
  return [...map.entries()]
    .map(([name, { sum, count }]) => ({
      name,
      value: round2(mode === 'avg' ? sum / count : mode === 'count' ? count : sum),
    }))
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

// Par jour (période ≤ 62 jours) ou par mois. agg = 'sum' ou 'avg'.
// En mode 'avg', "cumul" devient la moyenne cumulée depuis le début de la période.
export function groupByTime(data, dateColumn, measure, agg = 'sum') {
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

  const buckets = new Map()
  for (const [d, v] of points) {
    const key = granularity === 'day' ? isoDay(d) : `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
    const b = buckets.get(key) ?? { sum: 0, count: 0 }
    b.sum += v
    b.count++
    buckets.set(key, b)
  }

  let cumSum = 0
  let cumCount = 0
  const series = [...buckets.keys()].sort().map((key) => {
    const b = buckets.get(key)
    const [y, m, day] = key.split('-').map(Number)
    const date = new Date(y, m - 1, day || 1)

    cumSum += b.sum
    cumCount += b.count
    const value = round2(agg === 'avg' ? b.sum / b.count : b.sum)
    const cumul = round2(agg === 'avg' ? cumSum / cumCount : cumSum)

    const label =
      granularity === 'day'
        ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    return { key, label, value, cumul }
  })

  return { granularity, points: series }
}