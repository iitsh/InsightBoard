import { toDate } from './aggregate'

// Colonnes numériques qu'on évite de proposer comme mesure par défaut
const NOT_A_MEASURE = /(^id$|_id$|^id_|\bid\b|code|postal|zip|siret|tel|phone|annee|year|mois|month|jour|day)/i
// Noms qui ressemblent à une vraie mesure business : choisis en premier
const LOOKS_LIKE_MEASURE = /(revenu|revenue|vente|sales|montant|amount|total|prix|price|profit|marge|cout|cost|ca\b)/i

export function profileColumns(data, columns) {
  const sample = data.slice(0, 200)

  return columns.map((name) => {
    const values = sample.map((r) => r[name]).filter((v) => v !== null && v !== undefined && v !== '')
    let type = 'text'
    let distinct = 0

    if (values.length > 0) {
      if (values.every((v) => typeof v === 'number' && Number.isFinite(v))) {
        type = 'number'
      } else if (values.every((v) => toDate(v) !== null)) {
        type = 'date'
      } else {
        // Une colonne texte est une "catégorie" si elle a peu de valeurs distinctes
        distinct = new Set(data.map((r) => r[name])).size
        const manyRepeats = data.length <= 20 || distinct < data.length * 0.6
        if (distinct <= 50 && manyRepeats) type = 'category'
      }
    }
    return { name, type, distinct }
  })
}

export function pickDefaults(profile) {
  const measures = profile
    .filter((c) => c.type === 'number' && !NOT_A_MEASURE.test(c.name))
    .sort((a, b) => Number(LOOKS_LIKE_MEASURE.test(b.name)) - Number(LOOKS_LIKE_MEASURE.test(a.name)))

  // Si toutes les colonnes numériques ressemblent à des ID, on prend la première quand même
  const fallback = profile.find((c) => c.type === 'number')

  const categories = profile.filter((c) => c.type === 'category')
  const byRichness = [...categories].sort((a, b) => b.distinct - a.distinct)
  const dates = profile.filter((c) => c.type === 'date')

  return {
    measure: (measures[0] ?? fallback)?.name ?? null,
    // Classement : la catégorie la plus riche. Répartition : la plus "petite" (lisible en donut).
    dimension: byRichness[0]?.name ?? null,
    dimension2: byRichness[byRichness.length - 1]?.name ?? null,
    date: dates[0]?.name ?? null,
  }
}