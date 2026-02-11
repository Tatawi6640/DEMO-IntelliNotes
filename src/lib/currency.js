export function formatDH(value) {
  const n = Number(value || 0)
  const whole = Number.isFinite(n) ? Math.round(n) : 0
  try {
    const fmt = new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 })
    return `${fmt.format(whole)} DH`
  } catch {
    return `${whole} DH`
  }
}

export function formatPercent(value) {
  const n = Number(value || 0)
  const v = Number.isFinite(n) ? n : 0
  const pct = v * 100
  return `${Math.round(pct)}%`
}

export function formatDateTime(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('fr-MA')
  } catch {
    return String(ts)
  }
}
