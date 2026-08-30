import React from "react"
import { Bookmark, Search } from "lucide-react"

interface EmptyStateProps {
  mode?: "empty" | "no-results"
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

export function EmptyState({
  mode = "empty",
  title,
  subtitle,
  icon,
}: EmptyStateProps) {
  const isNoResults = mode === "no-results"

  const displayIcon =
    icon || (isNoResults ? <Search size={22} /> : <Bookmark size={22} />)
  const displayTitle =
    title || (isNoResults ? "No bookmarks found" : "No bookmarks yet")
  const displaySubtitle =
    subtitle ||
    (isNoResults
      ? "Try a different search term."
      : "Save your first webpage to see it here.")

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <span style={styles.icon}>{displayIcon}</span>
      </div>
      <h3 style={styles.title}>{displayTitle}</h3>
      <p style={styles.subtitle}>{displaySubtitle}</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "36px 20px",
    textAlign: "center",
    backgroundColor: "rgba(22, 25, 34, 0.4)",
    borderRadius: "14px",
    border: "1px dashed rgba(255, 255, 255, 0.1)",
    margin: "8px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    color: "#818cf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#f3f4f6",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
    maxWidth: "260px",
    lineHeight: "1.4",
  },
}
