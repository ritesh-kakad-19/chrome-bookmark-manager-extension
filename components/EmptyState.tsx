import React from "react"

export function EmptyState() {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <span style={styles.icon}>🔖</span>
      </div>
      <h3 style={styles.title}>No bookmarks yet</h3>
      <p style={styles.subtitle}>
        Save your first webpage to see it here.
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "32px 16px",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px dashed #e5e7eb",
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
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  icon: {
    fontSize: "24px",
  },
  title: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
    maxWidth: "240px",
    lineHeight: "1.4",
  },
}
