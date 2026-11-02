import { useEffect, useMemo, useRef, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import ExportMasthead from './ExportMasthead'
import { useDataStore } from '../store/useDataStore'
import { useLayoutStore } from '../store/useLayoutStore'
import { profileColumns, pickDefaults, defaultAgg } from '../utils/profile'
import { computeStats, groupByDimension, groupByTime, topWithOthers } from '../utils/aggregate'
import { applyFilters, distinctValues, dateBounds, describeFilters } from '../utils/filter'
import { fmtInt, UNITS, isMoneyLike } from '../utils/format'
import KpiStrip from './KpiStrip'
import ChartFrame from './ChartFrame'
import DataTable from './DataTable'
import FilterPanel from './FilterPanel'
import TrendChart from './charts/TrendChart'
import CumulativeChart from './charts/CumulativeChart'
import RankingChart from './charts/RankingChart'
import DonutChart from './charts/DonutChart'

const Grid = WidthProvider(Responsive)

// Tailles minimales : empêche de réduire un widget jusqu'à le rendre illisible
const MIN_SIZE = {
  kpi: { minW: 6, minH: 5 },
  trend: { minW: 4, minH: 8 },
  cumul: { minW: 3, minH: 8 },
  ranking: { minW: 4, minH: 8 },
  donut: { minW: 4, minH: 8 },
}

function Section({ index, title, children }) {
  return (
    <section className="px-8 pt-16">
      <p className="eyebrow">
        {index} — {title}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Select({ label, value, options, onChange }) {
  if (options.length === 0) return <div />
  return (
    <label className="relative block">
      <span className="eyebrow block">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full cursor-pointer appearance-none border-b border-ink bg-transparent py-1 pr-5 text-[13px] outline-none transition-colors duration-150 hover:border-accent focus:border-accent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute bottom-1.5 right-0 text-[11px] text-muted">↓</span>
    </label>
  )
}

// Bascule Somme / Moyenne : deux mots, celui qui est actif passe en orange
function AggToggle({ value, onChange }) {
  return (
    <div>
      <span className="eyebrow block">Calcul</span>
      <div className="mt-1.5 flex gap-5 border-b border-ink py-1 text-[13px]">
        {[
          ['sum', 'Somme'],
          ['avg', 'Moyenne'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={value === key}
            className={`transition-colors duration-150 ${
              value === key ? 'text-accent' : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Bouton « Filtres » + panneau déroulant.
// Se ferme au clic en dehors ou avec Échap.
function FilterMenu({ activeCount, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const lit = open || activeCount > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`border px-3.5 py-1.5 transition-colors duration-150 ${
          lit ? 'border-accent text-accent' : 'border-ink hover:border-accent hover:text-accent'
        }`}
      >
        Filtres{activeCount > 0 && ` (${activeCount})`} <span className="text-[11px]">{open ? '↑' : '↓'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-[70vh] w-[min(760px,calc(100vw-4rem))] overflow-y-auto border border-ink bg-paper p-6 [&>section]:px-0! [&>section]:pt-0!">
          {children}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data, columns, fileName, reset } = useDataStore()
  const { layout, update: updateLayout, resetLayout } = useLayoutStore()
  const [editing, setEditing] = useState(false)

  // --- Profil et réglages ---
  const profile = useMemo(() => profileColumns(data, columns), [data, columns])
  const defaults = useMemo(() => pickDefaults(profile), [profile])
  const [overrides, setOverrides] = useState({})
  const config = { ...defaults, ...overrides }
  const setConfig = (key) => (value) => setOverrides((o) => ({ ...o, [key]: value }))

  const { measure, dimension, dimension2, date } = config
  const agg = config.agg ?? defaultAgg(measure)

  // Unité : euro d'office pour une colonne qui ressemble à de l'argent.
  // Changer de mesure efface le choix manuel de l'unité.
  const unit = config.unit ?? (isMoneyLike(measure) ? '€' : '')
  const onMeasure = (v) => setOverrides(({ unit: _unit, ...rest }) => ({ ...rest, measure: v }))

  // --- Filtres ---
  const [selected, setSelected] = useState({})
  const [range, setRange] = useState({ from: '', to: '' })
  const setSelectedFor = (col, values) => setSelected((s) => ({ ...s, [col]: values }))

  // Colonnes filtrables + leurs valeurs, calculées sur les données COMPLÈTES
  // (sinon les autres valeurs disparaîtraient dès qu'on en sélectionne une)
  const filterable = useMemo(
    () =>
      profile
        .filter((c) => c.type === 'category' && c.distinct >= 2)
        .map((c) => ({ name: c.name, values: distinctValues(data, c.name) })),
    [profile, data]
  )
  const bounds = useMemo(
    () => (date ? dateBounds(data, date) : { min: null, max: null }),
    [data, date]
  )

  const filtered = useMemo(
    () => applyFilters(data, { selected, dateColumn: date, from: range.from, to: range.to }),
    [data, selected, date, range]
  )

  const activeCount =
    Object.values(selected).filter((v) => v.length > 0).length + (range.from || range.to ? 1 : 0)
  const filterSummary = describeFilters(selected, range)
  const clearFilters = () => {
    setSelected({})
    setRange({ from: '', to: '' })
  }

  // --- Calculs : tout lit `filtered`, plus `data` ---
  const stats = useMemo(() => (measure ? computeStats(filtered, measure) : null), [filtered, measure])
  const time = useMemo(
    () => (measure && date ? groupByTime(filtered, date, measure, agg) : null),
    [filtered, measure, date, agg]
  )
  const ranking = useMemo(
    () => (measure && dimension ? groupByDimension(filtered, dimension, measure, agg) : []),
    [filtered, measure, dimension, agg]
  )
  // Donut : une "part de moyennes" n'a pas de sens, on compte alors les lignes
  const split = useMemo(
    () =>
      measure && dimension2
        ? groupByDimension(filtered, dimension2, measure, agg === 'sum' ? 'sum' : 'count')
        : [],
    [filtered, measure, dimension2, agg]
  )
  const slices = useMemo(() => topWithOthers(split, 5), [split])

  const namesOf = (type) => profile.filter((c) => c.type === type).map((c) => c.name)
  const rankingOptions = profile
    .filter((c) => c.type === 'category' && c.distinct >= 2)
    .map((c) => c.name)
  const splitOptions = profile
    .filter((c) => c.type === 'category' && c.distinct >= 2 && c.distinct <= 8)
    .map((c) => c.name)

  const hasTime = time && time.points.length > 0
  const unitWord = time?.granularity === 'day' ? 'jour' : 'mois'
  const aggWord = agg === 'avg' ? 'Moyenne' : 'Somme'
  const isEmpty = filtered.length === 0

  const gridLayout = useMemo(() => layout.map((l) => ({ ...l, ...MIN_SIZE[l.i] })), [layout])

  return (
    <>
      {/* En-tête compact : le fichier + les paramètres */}
      <section className="grid grid-cols-12 items-end gap-x-8 gap-y-6 px-8 pt-6">
        <div className="col-span-12 lg:col-span-3">
          <p className="eyebrow">Tableau de bord</p>
          <h1 className="mt-2 break-words font-serif text-[30px] leading-[1.05] tracking-tight">
            {fileName}
          </h1>
          <p className="mt-2 font-mono text-[11px] text-muted">
            {fmtInt(filtered.length)}
            {filtered.length !== data.length && ` sur ${fmtInt(data.length)}`} lignes · {columns.length} colonnes
            <span className="mx-2">·</span>
            <button
              onClick={reset}
              className="underline underline-offset-4 transition-colors duration-150 hover:text-accent"
            >
              Changer de fichier
            </button>
          </p>
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-6 lg:col-span-9 lg:grid-cols-6">
          <Select label="Mesure" value={measure} options={namesOf('number')} onChange={onMeasure} />
          <Select
            label="Unité"
            value={unit || 'Aucune'}
            options={UNITS}
            onChange={(v) => setConfig('unit')(v === 'Aucune' ? '' : v)}
          />
          <AggToggle value={agg} onChange={setConfig('agg')} />
          <Select label="Classement par" value={dimension} options={rankingOptions} onChange={setConfig('dimension')} />
          <Select label="Répartition par" value={dimension2} options={splitOptions} onChange={setConfig('dimension2')} />
          <Select
            label="Date"
            value={date}
            options={namesOf('date')}
            onChange={(v) => {
              setConfig('date')(v)
              setRange({ from: '', to: '' }) // une période n'a de sens que pour sa colonne
            }}
          />
        </div>
      </section>

      {/* Barre d'outils : titre de section, filtres, disposition */}
      <section className="px-8 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-ink pt-3">
          <p className="eyebrow">{measure ? '01 — Visualisations' : '01 — Filtres'}</p>

          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            {filterSummary.length > 0 && (
              <p className="hidden max-w-[42ch] truncate font-mono text-[11px] text-muted lg:block">
                {filterSummary.join(' · ')}
              </p>
            )}

            <FilterMenu activeCount={activeCount}>
              <FilterPanel
                filterable={filterable}
                selected={selected}
                onSelect={setSelectedFor}
                dateColumn={date}
                bounds={bounds}
                from={range.from}
                to={range.to}
                onRange={setRange}
                activeCount={activeCount}
                onClear={clearFilters}
              />
            </FilterMenu>

            {measure && !isEmpty && editing && (
              <button
                onClick={resetLayout}
                className="text-muted underline underline-offset-4 transition-colors duration-150 hover:text-ink"
              >
                Rétablir la disposition
              </button>
            )}
            {measure && !isEmpty && (
              <button
                onClick={() => setEditing((e) => !e)}
                className={`border px-3.5 py-1.5 transition-colors duration-150 ${
                  editing
                    ? 'border-accent text-accent'
                    : 'border-ink hover:border-accent hover:text-accent'
                }`}
              >
                {editing ? 'Terminer' : 'Modifier la disposition'}
              </button>
            )}
          </div>
        </div>

        {!measure && (
          <p className="pt-8 font-mono text-[11px] text-muted">
            Ce fichier ne contient aucune colonne numérique : il n'y a rien à mesurer. Les données brutes sont
            affichées plus bas.
          </p>
        )}

        {measure && isEmpty && (
          <div className="mt-10">
            <p className="font-serif text-[32px] leading-tight tracking-tight">
              Aucune ligne ne correspond à ces filtres.
            </p>
            <p className="mt-3 text-[13px] text-muted">Élargissez la période ou retirez une valeur sélectionnée.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-[13px] text-muted underline underline-offset-4 transition-colors duration-150 hover:text-accent"
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {measure && !isEmpty && (
          <>
            {editing && (
              <p className="mt-3 font-mono text-[11px] text-muted">
                Déplacez un bloc par son en-tête. Redimensionnez-le par son coin inférieur droit.
              </p>
            )}

            {/* Zone capturée par l'export PNG / PDF */}
            <div id="export-zone" className="mt-6 bg-paper">
              <ExportMasthead
                fileName={fileName}
                shown={filtered.length}
                total={data.length}
                filters={filterSummary}
              />

              <div className={editing ? 'editing' : ''}>
                <Grid
                  layouts={{ lg: gridLayout }}
                  breakpoints={{ lg: 1024, sm: 0 }}
                  cols={{ lg: 12, sm: 1 }}
                  rowHeight={24}
                  margin={[32, 16]}
                  containerPadding={[0, 0]}
                  draggableHandle=".drag-handle"
                  isDraggable={editing}
                  isResizable={editing}
                  onLayoutChange={(_, all) => all.lg && updateLayout(all.lg)}
                >
                  <div key="kpi">
                    <div className="h-full overflow-hidden border-t border-ink pt-3">
                      <p className="eyebrow drag-handle">Indicateurs</p>
                      <div className="mt-6">
                        <KpiStrip
                          measure={measure}
                          agg={agg}
                          unit={unit}
                          stats={stats}
                          ranking={ranking}
                          dimension={dimension}
                          points={hasTime ? time.points : null}
                        />
                      </div>
                    </div>
                  </div>

                  {hasTime && (
                    <div key="trend">
                      <ChartFrame fig={1} title="Évolution" subtitle={`${aggWord} de ${measure} par ${unitWord}`}>
                        <TrendChart points={time.points} unit={unit} />
                      </ChartFrame>
                    </div>
                  )}

                  {hasTime && (
                    <div key="cumul">
                      <ChartFrame fig={2} title="Cumul" subtitle={`${aggWord} cumulée de ${measure}`}>
                        <CumulativeChart points={time.points} unit={unit} />
                      </ChartFrame>
                    </div>
                  )}

                  {ranking.length > 0 && (
                    <div key="ranking">
                      <ChartFrame
                        fig={3}
                        title="Classement"
                        subtitle={`${aggWord} de ${measure} par ${dimension} — 8 premiers`}
                      >
                        <RankingChart rows={ranking.slice(0, 8)} unit={unit} />
                      </ChartFrame>
                    </div>
                  )}

                  {split.length > 0 && (
                    <div key="donut">
                      <ChartFrame
                        fig={4}
                        title="Parts"
                        subtitle={
                          agg === 'sum'
                            ? `Part de ${measure} par ${dimension2}`
                            : `Part des lignes par ${dimension2}`
                        }
                      >
                        <DonutChart slices={slices} unit={agg === 'sum' ? unit : ''} />
                      </ChartFrame>
                    </div>
                  )}
                </Grid>
              </div>
            </div>

            {(!hasTime || ranking.length === 0) && (
              <p className="pt-8 font-mono text-[11px] text-muted">
                {!hasTime && "Pas de colonne de dates : l'évolution et le cumul ne sont pas affichés. "}
                {ranking.length === 0 && 'Pas de colonne de catégories : le classement et les parts ne sont pas affichés.'}
              </p>
            )}
          </>
        )}
      </section>

      <Section index="02" title="Données">
        <DataTable rows={filtered} total={data.length} profile={profile} />
      </Section>
    </>
  )
}