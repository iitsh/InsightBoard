import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Grille de 12 colonnes. x/y = position, w/h = taille (en colonnes / en lignes de 24 px)
export const DEFAULT_LAYOUT = [
  { i: 'kpi', x: 0, y: 0, w: 12, h: 7 },
  { i: 'trend', x: 0, y: 7, w: 8, h: 11 },
  { i: 'cumul', x: 8, y: 7, w: 4, h: 11 },
  { i: 'ranking', x: 0, y: 18, w: 7, h: 11 },
  { i: 'donut', x: 7, y: 18, w: 5, h: 11 },
]

export const useLayoutStore = create(
  persist(
    (set, get) => ({
      layout: DEFAULT_LAYOUT,

      // Fusionne : les widgets absents (ex. courbes sans date) gardent leur position mémorisée
      update: (next) => {
        const ids = new Set(next.map((l) => l.i))
        const kept = get().layout.filter((l) => !ids.has(l.i))
        const clean = next.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
        set({ layout: [...kept, ...clean] })
      },

      resetLayout: () => set({ layout: DEFAULT_LAYOUT }),
    }),
    { name: 'insightboard-layout' }
  )
)