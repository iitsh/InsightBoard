import { useMemo, useState } from 'react'
import { useDataStore } from '../store/useDataStore'
import { profileColumns, pickDefaults } from '../utils/profile'
import { computeStats, groupByDimension, groupByTime, topWithOthers } from '../utils/aggregate'
import { fmtInt } from '../utils/format'
import KpiStrip from './KpiStrip'
import ChartFrame from './ChartFrame'
import DataTable from './DataTable'
import TrendChart from './charts/TrendChart'
import CumulativeChart from './charts/CumulativeChart'
import RankingChart from './charts/RankingChart'
import DonutChart from './charts/DonutChart'

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

export default function Dashboard() {
  const { data, columns, fileName, reset } = useDataStore()

  const profile = useMemo(() => profileColumns(data, columns), [data, columns])
  const defaults = useMemo(() => pickDefaults(profile), [profile])
  const [overrides, setOverrides] = useState({})
  const config = { ...defaults, ...overrides }
  const setConfig = (key) => (value) => setOverrides((o) => ({ ...o, [key]: value }))

  const { measure, dimension, dimension2, date } = config

  const stats = useMemo(() => (measure ? computeStats(data, measure) : null), [data, measure])
  const time = useMemo(
    () => (measure && date ? groupByTime(data, date, measure) : null),
    [data, measure, date]
  )
  const ranking = useMemo(
    () => (measure && dimension ? groupByDimension(data, dimension, measure) : []),
    [data, measure, dimension]
  )
  const split = useMemo(
    () => (measure && dimension2 ? groupByDimension(data, dimension2, measure) : []),
    [data, measure, dimension2]
  )
  const slices = useMemo(() => topWithOthers(split, 5), [split])

  const namesOf = (type) => profile.filter((c) => c.type === type).map((c) => c.name)
  const hasTime = time && time.points.length > 0
  const unit = time?.granularity === 'day' ? 'jour' : 'mois'

  return (
    <>
      {/* En-tête : le fichier + les paramètres */}
      <section className="grid grid-cols-12 items-end gap-x-8 gap-y-10 px-8 pt-12">
        <div className="col-span-12 lg:col-span-4">
          <p className="eyebrow">Tableau de bord</p>
          <h1 className="mt-4 break-words font-serif text-[40px] leading-[1.02] tracking-tight">
            {fileName}
          </h1>
          <p className="mt-3 font-mono text-[11px] text-muted">
            {fmtInt(data.length)} lignes · {columns.length} colonnes
          </p>
          <button
            onClick={reset}
            className="mt-5 text-[13px] text-muted underline underline-offset-4 transition-colors duration-150 hover:text-accent"
          >
            Réinitialiser
          </button>
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-6 lg:col-span-8 lg:grid-cols-4">
          <Select label="Mesure" value={measure} options={namesOf('number')} onChange={setConfig('measure')} />
          <Select label="Classement par" value={dimension} options={namesOf('category')} onChange={setConfig('dimension')} />
          <Select label="Répartition par" value={dimension2} options={namesOf('category')} onChange={setConfig('dimension2')} />
          <Select label="Date" value={date} options={namesOf('date')} onChange={setConfig('date')} />
        </div>
      </section>

      {!measure && (
        <p className="px-8 pt-12 font-mono text-[11px] text-muted">
          Aucune colonne numérique détectée : impossible de calculer des indicateurs. Le contenu brut du fichier est
          affiché ci-dessous.
        </p>
      )}

      {measure && (
        <>
          <Section index="01" title="Indicateurs">
            <KpiStrip
              measure={measure}
              stats={stats}
              ranking={ranking}
              dimension={dimension}
              points={hasTime ? time.points : null}
            />
          </Section>

          {hasTime && (
            <Section index="02" title="Évolution">
              <div className="grid grid-cols-12 gap-x-8 gap-y-12">
                <div className="col-span-12 lg:col-span-8">
                  <ChartFrame
                    fig={1}
                    title="Évolution"
                    subtitle={`Somme de ${measure} par ${unit}`}
                  >
                    <TrendChart points={time.points} />
                  </ChartFrame>
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <ChartFrame fig={2} title="Cumul" subtitle={`Somme cumulée de ${measure}`}>
                    <CumulativeChart points={time.points} />
                  </ChartFrame>
                </div>
              </div>
            </Section>
          )}

          {ranking.length > 0 && (
            <Section index="03" title="Répartition">
              <div className="grid grid-cols-12 gap-x-8 gap-y-12">
                <div className="col-span-12 lg:col-span-7">
                  <ChartFrame
                    fig={3}
                    title="Classement"
                    subtitle={`${measure} par ${dimension} — 8 premiers`}
                  >
                    <RankingChart rows={ranking.slice(0, 8)} />
                  </ChartFrame>
                </div>
                <div className="col-span-12 lg:col-span-5">
                  <ChartFrame fig={4} title="Parts" subtitle={`Part de ${measure} par ${dimension2}`}>
                    <DonutChart slices={slices} />
                  </ChartFrame>
                </div>
              </div>
            </Section>
          )}

          {(!hasTime || ranking.length === 0) && (
            <p className="px-8 pt-12 font-mono text-[11px] text-muted">
              {!hasTime && 'Aucune colonne de date détectée : les graphiques d’évolution sont masqués. '}
              {ranking.length === 0 && 'Aucune colonne de catégories détectée : classement et parts masqués.'}
            </p>
          )}
        </>
      )}

      <Section index={measure ? '04' : '01'} title="Données">
        <DataTable profile={profile} />
      </Section>
    </>
  )
}