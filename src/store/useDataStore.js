import { create } from 'zustand'

export const useDataStore = create((set) => ({
  // --- L'état (les données stockées en mémoire) ---
  fileName: null,   // nom du fichier importé
  data: [],         // les lignes du CSV, sous forme de tableau d'objets
  columns: [],      // les noms des colonnes

  // --- Les actions (les fonctions qui modifient l'état) ---
  setDataset: (fileName, data) =>
    set({
      fileName,
      data,
      columns: data.length > 0 ? Object.keys(data[0]) : [],
    }),

  reset: () => set({ fileName: null, data: [], columns: [] }),
}))