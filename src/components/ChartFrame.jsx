export default function ChartFrame({ fig, title, subtitle, height = 300, children }) {
  return (
    <div className="border-t border-ink pt-3">
      <p className="eyebrow">Fig. {fig}</p>
      <h3 className="mt-3 font-serif text-[26px] leading-none tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[12px] text-muted">{subtitle}</p>
      <div className="mt-6" style={{ height }}>
        {children}
      </div>
    </div>
  )
}