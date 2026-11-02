const int = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 })
const decimal2 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })
const percentSigned = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

export const fmtInt = (n) => int.format(n)
export const fmtCompact = (n) => compact.format(n)
export const fmtNumber = (n) => (Math.abs(n) >= 100 ? int.format(n) : decimal2.format(n))
export const fmtPercent = (x, signed = false) => (signed ? percentSigned : percent).format(x)
export const UNITS = ['Aucune', '€', '$']

// Colonnes dont le nom évoque de l'argent : l'euro est proposé d'office
const MONEY =
  /sales|profit|revenue|revenu|price|prix|amount|montant|cost|co[uû]t|vente|chiffre|marge|margin|salary|salaire|budget|(^|[^a-z])ca([^a-z]|$)/i

export const isMoneyLike = (name) => MONEY.test(String(name || ''))

// "1 234 €" : espace insécable pour que le symbole ne passe jamais à la ligne
export const withUnit = (text, unit) => (unit ? `${text}\u00A0${unit}` : text)