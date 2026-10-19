const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

/** Format integer cents as USD, e.g. 2800 -> "$28.00" */
export const money = (cents) => usd.format(cents / 100)

/** "$28.00" plus a struck-through compare-at price when it exists */
export const hasDiscount = (product) =>
  typeof product.compareAt === 'number' && product.compareAt > product.price

/** Delivery window copy, e.g. "Arrives Oct 23 – Oct 27" */
export function deliveryWindow(offsetDays = 4) {
  const start = new Date()
  start.setDate(start.getDate() + offsetDays)
  const end = new Date(start)
  end.setDate(end.getDate() + 3)
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
