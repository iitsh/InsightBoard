import { create } from 'zustand'
import { parseFile } from '../utils/parseFile'

export const useDataStore = create((set) => ({
  fileName: null,
  data: [],
  columns: [],
  loadedAt: null,
  loading: false,
  error: null,

  setDataset: (fileName, data) =>
    set({
      fileName,
      data,
      columns: data.length > 0 ? Object.keys(data[0]) : [],
      loadedAt: new Date(),
      error: null,
    }),

  // Action asynchrone : lit le fichier, puis met à jour la mémoire
  importFile: async (file) => {
    if (!file) return
    set({ loading: true, error: null })
    try {
      const rows = await parseFile(file)
      if (rows.length === 0) throw new Error('Le fichier ne contient aucune ligne exploitable.')
      set({
        fileName: file.name,
        data: rows,
        columns: Object.keys(rows[0]),
        loadedAt: new Date(),
        loading: false,
      })
    } catch (e) {
      set({ loading: false, error: e.message })
    }
  },

  reset: () => set({ fileName: null, data: [], columns: [], loadedAt: null, error: null }),
}))