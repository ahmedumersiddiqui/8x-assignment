/** Money typed by a human, in dollars, turned into integer minor units.
 *
 * Deliberately not `Number(input) * 100`: that routes the price through a float, and
 * 24.99 * 100 is 2498.9999999999995. Splitting the string and doing integer arithmetic
 * keeps the whole price path in cents, which is the one rule the money code does not bend.
 */
const MONEY = /^\s*\$?\s*(\d{1,7})(?:[.,](\d{1,2}))?\s*$/

export const parseMoneyToCents = (input: string): number | null => {
  const match = MONEY.exec(input)
  if (!match) return null
  const [, dollars, fraction = ''] = match
  return Number(dollars) * 100 + Number(fraction.padEnd(2, '0'))
}

/** The inverse, for prefilling an edit form from stored cents. */
export const centsToMoneyInput = (cents: number): string =>
  `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, '0')}`
