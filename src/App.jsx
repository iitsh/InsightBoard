import { useDataStore } from './store/useDataStore'

export default function App() {
  const { fileName, data, columns, setDataset, reset } = useDataStore()

  const loadFakeData = () => {
    setDataset('test.csv', [
      { Produit: 'A', Ventes: 120 },
      { Produit: 'B', Ventes: 80 },
      { Produit: 'C', Ventes: 200 },
    ])
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-blue-700">InsightBoard</h1>
      <p className="text-slate-600 mb-6">Dashboard BI interactif</p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={loadFakeData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Charger des données test
        </button>
        <button
          onClick={reset}
          className="bg-slate-300 px-4 py-2 rounded hover:bg-slate-400"
        >
          Réinitialiser
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p><strong>Fichier :</strong> {fileName ?? 'aucun'}</p>
        <p><strong>Colonnes :</strong> {columns.join(', ') || '—'}</p>
        <p><strong>Nombre de lignes :</strong> {data.length}</p>
      </div>
    </div>
  )
}