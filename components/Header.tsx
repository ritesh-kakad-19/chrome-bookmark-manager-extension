import React from "react"
import { Bookmark, X } from "lucide-react"

interface HeaderProps {
  itemCount: number
  onClose: () => void
}

export function Header({ itemCount, onClose }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.leftGroup}>
        <div style={styles.logoBadge}>
          <Bookmark size={18} style={styles.logoIcon} />
        </div>
        <div style={styles.titleColumn}>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>Bookmark Manager</h1>
            <span style={styles.badge}>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <p style={styles.subtitle}>Your saved web, organized.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={styles.closeButton}
        aria-label="Close Bookmark Manager"
        title="Close (Esc)"
      >
        <X size={16} />
      </button>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  leftGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.1) 100%)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 12px rgba(99, 102, 241, 0.2)",
    flexShrink: 0,
  },
  logoIcon: {
    color: "#818cf8",
  },
  titleColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#f3f4f6",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  badge: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#818cf8",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  subtitle: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
  },
  closeButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
}
