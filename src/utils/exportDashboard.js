// Export du dashboard en PNG ou PDF.
// html2canvas-pro et jsPDF sont chargés à la demande (import dynamique) :
// ils pèsent lourd et ne servent qu'au clic.

const ZONE_ID = 'export-zone'
const PAD = 48 // marge autour du dashboard, en px CSS
const SCALE = 2 // résolution x2 pour un rendu net

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return [255, 255, 255]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function baseName(fileName) {
  const clean = (fileName || 'dashboard')
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  const day = new Date().toISOString().slice(0, 10)
  return `insightboard-${clean || 'dashboard'}-${day}`
}

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Capture la zone et renvoie un canvas avec marge, sur fond --paper.
async function capture() {
  const zone = document.getElementById(ZONE_ID)
  if (!zone) throw new Error("Zone d'export introuvable (#export-zone)")

  // On attend que Instrument Serif / Inter / JetBrains Mono soient chargées.
  await document.fonts.ready

  const paper = cssVar('--paper', '#FAFAF7')
  const { default: html2canvas } = await import('html2canvas-pro')

  const shot = await html2canvas(zone, {
    scale: SCALE,
    backgroundColor: paper,
    logging: false,
    onclone: (doc) => {
      // Révèle l'en-tête de rapport (caché à l'écran)
      doc.querySelectorAll('[data-export-only]').forEach((el) => {
        el.style.display = 'block'
      })
      // Nettoie les traces du mode édition
      const style = doc.createElement('style')
      style.textContent = `
        .react-resizable-handle,
        .react-grid-placeholder { display: none !important; }
        .react-grid-item { transition: none !important; }
        .editing, .editing * { outline: none !important; }
      `
      doc.head.appendChild(style)
    },
  })

  // Ajoute la marge sur un canvas plus grand, rempli de la couleur du papier.
  const pad = PAD * SCALE
  const out = document.createElement('canvas')
  out.width = shot.width + pad * 2
  out.height = shot.height + pad * 2
  const ctx = out.getContext('2d')
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(shot, pad, pad)

  return { canvas: out, paper }
}

export async function exportPng(fileName) {
  const { canvas } = await capture()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  download(blob, `${baseName(fileName)}.png`)
}

export async function exportPdf(fileName) {
  const { canvas, paper } = await capture()
  const { jsPDF } = await import('jspdf')

  // Orientation choisie selon la forme du dashboard
  const landscape = canvas.width >= canvas.height
  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()

  // Fond de page = couleur du thème (important en mode sombre)
  const [r, g, b] = hexToRgb(paper)
  pdf.setFillColor(r, g, b)
  pdf.rect(0, 0, pw, ph, 'F')

  // Image ajustée à la page, centrée horizontalement, alignée en haut
  const ratio = Math.min(pw / canvas.width, ph / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pw - w) / 2, 0, w, h, undefined, 'FAST')

  pdf.setProperties({
    title: `InsightBoard — ${fileName || 'Dashboard'}`,
    creator: 'InsightBoard',
  })
  pdf.save(`${baseName(fileName)}.pdf`)
}   