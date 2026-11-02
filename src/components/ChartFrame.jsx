export default function ChartFrame({ fig, title, subtitle, children }) {
  return (
    <div className="flex h-full flex-col border-t border-ink pt-3">
      {/* L'en-tête sert de poignée de déplacement (classe drag-handle) */}
      <div className="drag-handle shrink-0">
        <p className="eyebrow">Fig. {fig}</p>
        <h3 className="mt-3 font-serif text-[26px] leading-none tracking-tight">{title}</h3>
        <p className="mt-1.5 text-[12px] text-muted">{subtitle}</p>
      </div>

      {/* Zone du graphique : prend tout l'espace restant */}
      <div className="relative mt-5 min-h-0 flex-1">
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  )
}