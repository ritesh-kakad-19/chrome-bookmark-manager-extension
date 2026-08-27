import React, { useState } from "react"
import type { Bookmark } from "../types"

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [faviconError, setFaviconError] = useState<boolean>(false)

  const getHostname = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr)
      return parsed.hostname.replace(/^www\./, "") || urlStr
    } catch {
      return urlStr
    }
  }

  const formatDate = (isoStr: string): string => {
    try {
      const date = new Date(isoStr)
      if (isNaN(date.getTime())) return ""
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return ""
    }
  }

  const hostname = getHostname(bookmark.url)
  const formattedDate = formatDate(bookmark.createdAt)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`

  const handleOpen = () => {
    if (chrome?.tabs?.create && bookmark.url) {
      chrome.tabs.create({ url: bookmark.url })
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.faviconContainer}>
          {!faviconError ? (
            <img
              src={faviconUrl}
              alt=""
              onError={() => setFaviconError(true)}
              style={styles.favicon}
            />
          ) : (
            <span style={styles.fallbackIcon}>🔖</span>
          )}
        </div>
        <div style={styles.titleContainer}>
          <h4 style={styles.title} title={bookmark.title || "Untitled"}>
            {bookmark.title || "Untitled"}
          </h4>
          <span style={styles.domain} title={bookmark.url}>
            {hostname}
          </span>
        </div>
      </div>

      <div style={styles.footerRow}>
        <span style={styles.date}>
          {formattedDate ? `Saved: ${formattedDate}` : ""}
        </span>

        <div style={styles.actions}>
          <button
            onClick={handleOpen}
            style={styles.openButton}
            title="Open bookmark in new tab"
          >
            Open ↗
          </button>
          <button
            onClick={() => onDelete(bookmark.id)}
            style={styles.deleteButton}
            title="Delete bookmark"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    overflow: "hidden",
  },
  faviconContainer: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  favicon: {
    width: "16px",
    height: "16px",
    borderRadius: "2px",
  },
  fallbackIcon: {
    fontSize: "12px",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flex: 1,
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.3",
  },
  domain: {
    fontSize: "12px",
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "2px",
  },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "6px",
    borderTop: "1px solid #f9fafb",
  },
  date: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "400",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  openButton: {
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  deleteButton: {
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
}
