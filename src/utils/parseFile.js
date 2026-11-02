import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const getExtension = (name) => name.split('.').pop().toLowerCase()

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,          // la 1re ligne = noms des colonnes
      dynamicTyping: true,   // "120" devient le nombre 120
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (err) => reject(new Error(err.message)),
    })
  })
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(firstSheet, { defval: null })
}

export async function parseFile(file) {
  const ext = getExtension(file.name)
  if (ext === 'csv') return parseCsv(file)
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file)
  throw new Error('Format non pris en charge. Utilisez .csv, .xlsx ou .xls.')
}