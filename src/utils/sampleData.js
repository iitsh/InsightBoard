// Générateur pseudo-aléatoire à graine fixe : mêmes données à chaque chargement
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const REGIONS = ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Nouvelle-Aquitaine', 'Hauts-de-France']

const CATALOG = {
  Mobilier: [['Bureau', 320], ['Chaise', 140], ['Étagère', 90]],
  Technologie: [['Écran', 210], ['Clavier', 60], ['Casque', 110]],
  Papeterie: [['Carnet', 8], ['Classeur', 12], ['Stylo', 3]],
}

export function generateSampleData(count = 400) {
  const rand = mulberry32(42)
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]
  const categories = Object.keys(CATALOG)
  const start = new Date('2024-01-01').getTime()
  const rows = []

  for (let i = 0; i < count; i++) {
    const categorie = pick(categories)
    const [produit, prix] = pick(CATALOG[categorie])
    const quantite = 1 + Math.floor(rand() * 10)
    const jour = Math.floor(rand() * 366)
    const date = new Date(start + jour * 86400000).toISOString().slice(0, 10)

    rows.push({
      Date: date,
      Region: pick(REGIONS),
      Categorie: categorie,
      Produit: produit,
      Quantite: quantite,
      Revenu: Math.round(prix * quantite * (0.9 + rand() * 0.2)),
    })
  }
  return rows.sort((a, b) => a.Date.localeCompare(b.Date))
}