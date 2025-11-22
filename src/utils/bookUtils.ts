/**
 * Parses course tag from format "2025_UPSC_PRELIMS" to "UPSC Prelims"
 * Skips PAID_USER tag
 */
export const parseCourseTag = (tag: string): string | null => {
  if (tag === 'PAID_USER') return null

  const parts = tag.split('_')
  if (parts.length < 2) return tag

  // Remove year prefix (first part), format rest as Title Case
  return parts
    .slice(1)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Formats price in rupees from paise
 */
export const formatPrice = (priceInPaise: number): string => {
  return `₹${(priceInPaise / 100).toFixed(2)}`
}
