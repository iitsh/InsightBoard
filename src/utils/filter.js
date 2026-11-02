import { toDate, isoDay, labelOf } from './aggregate'

// Valeurs distinctes d'une colonne, triées (pour construire les filtres)
export function distinctValues(data, column) {
  return [...new Set(data.map((r) => labelOf(r[column])))].sort((a, b) =>
    a.localeCompare(b, 'fr', { numeric: true })
  )
}

// Première et dernière date d'une colonne, au format "AAAA-MM-JJ"
export function dateBounds(data, column) {
  let min = null
  let max = null
  for (const row of data) {
    const d = toDate(row[column])
    if (!d) continue
    const k = isoDay(d)
    if (min === null || k < min) min = k
    if (max === null || k > max) max = k
  }
  return { min, max }
}

// selected : { Region: ['West', 'East'], ... }  (liste vide = pas de filtre sur cette colonne)
export function applyFilters(data, { selected, dateColumn, from, to }) {
  const active = Object.entries(selected)
    .filter(([, values]) => values.length > 0)
    .map(([col, values]) => [col, new Set(values)])
  const useDate = Boolean(dateColumn && (from || to))

  // Aucun filtre : on renvoie le même tableau (évite des recalculs inutiles)
  if (active.length === 0 && !useDate) return data

  return data.filter((row) => {
    for (const [col, set] of active) {
      if (!set.has(labelOf(row[col]))) return false
    }
    if (useDate) {
      const d = toDate(row[dateColumn])
      if (!d) return false
      const k = isoDay(d) // "AAAA-MM-JJ" : la comparaison de texte suit l'ordre chronologique
      if (from && k < from) return false
      if (to && k > to) return false
    }
    return true
  })
}