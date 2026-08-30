import React, { useState } from "react"
import { ExternalLink, Globe, Trash2 } from "lucide-react"
import type { Bookmark } from "../types"
import { formatRelativeDate } from "../utils/dateUtils"

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [faviconError, setFaviconError] = useState<boolean>(false)
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const getHostname = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr)
      return parsed.hostname.replace(/^www\./, "") || urlStr
    } catch {
      return urlStr
    }
  }

  const hostname = getHostname(bookmark.url)
  const formattedDate = formatRelativeDate(bookmark.createdAt)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (chrome?.tabs?.create && bookmark.url) {
      chrome.tabs.create({ url: bookmark.url })
    } else if (bookmark.url) {
      window.open(bookmark.url, "_blank")
    }
  }

  const handleInitiateDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirming(true)
  }

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(bookmark.id)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirming(false)
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHovered : {}),
      }}
    >
      <div style={styles.topRow}>
        <div style={styles.faviconContainer}>
          {!faviconError ? (
            <img
              src={faviconUrl}
              alt=""
              onError={() => setFaviconError(true)}
              style={styles.favicon}
            />
          ) : (
            <Globe size={14} style={styles.fallbackIcon} />
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

      <div style={styles.bottomRow}>
        {!isConfirming ? (
          <>
            <span style={styles.date}>{formattedDate}</span>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleOpen}
                style={styles.openButton}
                aria-label="Open bookmark in new tab"
                title="Open bookmark"
              >
                <span>Open</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={handleInitiateDelete}
                style={styles.deleteButton}
                aria-label="Delete bookmark"
                title="Delete bookmark"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        ) : (
          <div style={styles.confirmRow}>
            <span style={styles.confirmText}>Delete this bookmark?</span>
            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={styles.confirmDeleteButton}
                aria-label="Confirm deletion"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                style={styles.cancelButton}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "rgba(22, 25, 34, 0.6)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "12px",
    transition: "all 0.15s ease",
    boxSizing: "border-box",
  },
  cardHovered: {
    backgroundColor: "rgba(30, 34, 46, 0.8)",
    borderColor: "rgba(99, 102, 241, 0.4)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.4), 0 0 12px rgba(99, 102, 241, 0.1)",
  },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  faviconContainer: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  },
  favicon: {
    width: "16px",
    height: "16px",
    borderRadius: "2px",
  },
  fallbackIcon: {
    color: "#818cf8",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flex: 1,
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#f3f4f6",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.3",
  },
  domain: {
    fontSize: "12px",
    color: "#9ca3af",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "3px",
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "8px",
    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
  },
  date: {
    fontSize: "11px",
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  openButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#818cf8",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  deleteButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 6px",
    fontSize: "11px",
    color: "#f87171",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  confirmRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmText: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#f87171",
  },
  confirmDeleteButton: {
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#9ca3af",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "5px",
    cursor: "pointer",
  },
}
