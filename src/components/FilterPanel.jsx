import { useState } from 'react'

const COMPACT = 6 // jusqu'à 6 valeurs : toutes affichées en boutons

function Tag({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border px-2.5 py-1 text-[12px] transition-colors duration-150 ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-rule text-muted hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Row({ label, action, children }) {
  return (
    <div className="grid grid-cols-12 gap-x-8 border-b border-rule py-4">
      <p className="eyebrow col-span-12 pt-1.5 lg:col-span-2">{label}</p>
      <div className="col-span-12 mt-2 flex items-start justify-between gap-6 lg:col-span-10 lg:mt-0">
        <div className="min-w-0 flex-1">{children}</div>
        {action}
      </div>
    </div>
  )
}

function ValueFilter({ values, selected, onChange }) {
  const toggle = (v) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])

  // Peu de valeurs : tous les boutons visibles
  if (values.length <= COMPACT) {
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Tag key={v} active={selected.includes(v)} onClick={() => toggle(v)}>
            {v}
          </Tag>
        ))}
      </div>
    )
  }

  // Beaucoup de valeurs : étiquettes des valeurs choisies + liste pour en ajouter
  const remaining = values.filter((v) => !selected.includes(v))
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.map((v) => (
        <Tag key={v} active onClick={() => toggle(v)}>
          {v} ×
        </Tag>
      ))}
      {remaining.length > 0 && (
        <select
          value=""
          onChange={(e) => e.target.value && onChange([...selected, e.target.value])}
          className="cursor-pointer border-b border-ink bg-transparent py-1 text-[12px] outline-none transition-colors duration-150 hover:border-accent focus:border-accent"
        >
          <option value="">{selected.length === 0 ? 'Toutes — choisir…' : 'Ajouter…'}</option>
          {remaining.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

const dateInput =
  'border-b border-ink bg-transparent py-1 font-mono text-[12px] outline-none transition-colors duration-150 hover:border-accent focus:border-accent'

export default function FilterPanel({
  filterable, selected, onSelect, dateColumn, bounds, from, to, onRange, activeCount, onClear,
}) {
  // Lignes affichées au départ : les colonnes compactes (max 3). Les autres s'ajoutent à la demande.
  const [shown, setShown] = useState(() =>
    filterable.filter((f) => f.values.length <= COMPACT).slice(0, 3).map((f) => f.name)
  )

  const visible = filterable.filter((f) => shown.includes(f.name))
  const hidden = filterable.filter((f) => !shown.includes(f.name))

  const hasDate = Boolean(dateColumn && bounds.min)
  const years = hasDate
    ? Array.from(
        { length: Number(bounds.max.slice(0, 4)) - Number(bounds.min.slice(0, 4)) + 1 },
        (_, i) => Number(bounds.min.slice(0, 4)) + i
      )
    : []

  return (
    <section className="px-8 pt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="eyebrow">01 — Filtres</p>
        <div className="flex items-center gap-6 font-mono text-[11px] text-muted">
          <span>Aucune sélection = toutes les valeurs</span>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-[13px] underline underline-offset-4 transition-colors duration-150 hover:text-accent"
            >
              Effacer les filtres ({activeCount})
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-ink">
        {hasDate && (
          <Row label={`Période · ${dateColumn}`}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-4 text-[13px]">
                <label className="flex items-center gap-2">
                  <span className="eyebrow">Du</span>
                  <input
                    type="date"
                    value={from}
                    min={bounds.min}
                    max={to || bounds.max}
                    onChange={(e) => onRange({ from: e.target.value, to })}
                    className={dateInput}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="eyebrow">Au</span>
                  <input
                    type="date"
                    value={to}
                    min={from || bounds.min}
                    max={bounds.max}
                    onChange={(e) => onRange({ from, to: e.target.value })}
                    className={dateInput}
                  />
                </label>
              </div>

              {years.length >= 2 && years.length <= 12 && (
                <div className="flex flex-wrap gap-2">
                  <Tag active={!from && !to} onClick={() => onRange({ from: '', to: '' })}>
                    Tout
                  </Tag>
                  {years.map((y) => (
                    <Tag
                      key={y}
                      active={from === `${y}-01-01` && to === `${y}-12-31`}
                      onClick={() => onRange({ from: `${y}-01-01`, to: `${y}-12-31` })}
                    >
                      {y}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </Row>
        )}

        {visible.map((f) => (
          <Row
            key={f.name}
            label={f.name}
            action={
              <button
                onClick={() => {
                  onSelect(f.name, [])
                  setShown((s) => s.filter((n) => n !== f.name))
                }}
                className="shrink-0 pt-1 text-[12px] text-muted transition-colors duration-150 hover:text-ink"
              >
                Retirer
              </button>
            }
          >
            <ValueFilter
              values={f.values}
              selected={selected[f.name] ?? []}
              onChange={(vals) => onSelect(f.name, vals)}
            />
          </Row>
        ))}
      </div>

      {hidden.length > 0 && (
        <div className="pt-4">
          <select
            value=""
            onChange={(e) => e.target.value && setShown((s) => [...s, e.target.value])}
            className="cursor-pointer border-b border-ink bg-transparent py-1 text-[13px] outline-none transition-colors duration-150 hover:border-accent focus:border-accent"
          >
            <option value="">+ Ajouter un filtre…</option>
            {hidden.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  )
}