export function splitPrice(cents: number) {
  const whole = Math.trunc(cents / 100).toLocaleString('en-US')
  return { whole, fraction: String(Math.abs(cents % 100)).padStart(2, '0') }
}

export function formatPrice(cents: number) {
  const { whole, fraction } = splitPrice(cents)
  return `$${whole}.${fraction}`
}

export function percentOff(price: number, list: number | null) {
  if (!list || list <= price) return null
  return Math.round(((list - price) / list) * 100)
}

export const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatMegabytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`

/** "image/jpeg" -> "JPEG", for telling a seller what the file picker will accept. */
export const formatImageTypes = (types: string[]) =>
  types.map((type) => type.replace('image/', '').toUpperCase()).join(', ')
