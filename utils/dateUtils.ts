/**
 * Formats an ISO date string into a relative time string (e.g. "Saved 2h ago", "Saved yesterday")
 */
export function formatRelativeDate(isoStr: string): string {
  if (!isoStr) return ""
  try {
    const date = new Date(isoStr)
    const time = date.getTime()
    if (isNaN(time)) return ""

    const now = Date.now()
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) {
      return "Saved just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `Saved ${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `Saved ${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) {
      return "Saved yesterday"
    }

    if (diffInDays < 30) {
      return `Saved ${diffInDays}d ago`
    }

    return `Saved ${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`
  } catch {
    return ""
  }
}
