import React, { useEffect, useState } from "react"
import { Check, Plus, AlertTriangle, Sparkles } from "lucide-react"
import type { Bookmark, StorageData } from "../types"
import { BookmarkGrid } from "./BookmarkGrid"
import { EmptyState } from "./EmptyState"
import { Header } from "./Header"
import { SearchBar } from "./SearchBar"

interface BookmarkManagerProps {
  onClose: () => void
}

export function BookmarkManager({ onClose }: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const loadBookmarks = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      if (chrome?.storage?.local) {
        const result: StorageData = await chrome.storage.local.get("bookmarks")
        setBookmarks(result.bookmarks || [])
      } else {
        setBookmarks([])
      }
    } catch (err: any) {
      console.error("Failed to load bookmarks from storage:", err)
      setLoadError("Unable to load bookmarks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookmarks()

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes.bookmarks) {
        setBookmarks(changes.bookmarks.newValue || [])
      }
    }

    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange)
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange)
      }
    }
  }, [])

  const saveBookmark = async () => {
    setIsSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      let activeTab: chrome.tabs.Tab | null = null

      if (chrome?.tabs?.query) {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (tabs && tabs.length > 0) {
          activeTab = tabs[0]
        }
      }

      // Fallback if content script environment provides window info
      const currentUrl = activeTab?.url || (typeof window !== "undefined" ? window.location.href : "")
      const currentTitle = activeTab?.title || (typeof document !== "undefined" ? document.title : "Untitled")

      const isInvalidUrl = (url?: string): boolean => {
        if (!url || !url.trim()) return true
        const trimmed = url.trim().toLowerCase()
        return (
          trimmed === "about:blank" ||
          trimmed.startsWith("about:") ||
          trimmed.startsWith("chrome://") ||
          trimmed.startsWith("chrome-extension://") ||
          trimmed.startsWith("edge://") ||
          trimmed.startsWith("view-source:")
        )
      }

      if (isInvalidUrl(currentUrl)) {
        setErrorMessage("Cannot save blank or internal browser pages.")
        setIsSaving(false)
        return
      }

      const result: StorageData = chrome?.storage?.local
        ? await chrome.storage.local.get("bookmarks")
        : { bookmarks }
      const existingBookmarks: Bookmark[] = result.bookmarks || bookmarks

      const isDuplicate = existingBookmarks.some((b) => b.url === currentUrl)

      if (isDuplicate) {
        setErrorMessage("Bookmark already saved.")
        setIsSaving(false)
        return
      }

      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString()

      const newBookmark: Bookmark = {
        id,
        title: currentTitle || "Untitled",
        url: currentUrl,
        createdAt: new Date().toISOString(),
      }

      const updatedBookmarks = [newBookmark, ...existingBookmarks]

      if (chrome?.storage?.local) {
        await chrome.storage.local.set({
          bookmarks: updatedBookmarks,
        })
      }

      setBookmarks(updatedBookmarks)
      setSuccessMessage("Bookmark saved successfully.")
    } catch (err: any) {
      console.error("Error saving bookmark:", err)
      setErrorMessage(
        err?.message || "Failed to save bookmark. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    try {
      const updated = bookmarks.filter((b) => b.id !== id)
      setBookmarks(updated)
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ bookmarks: updated })
      }
    } catch (err: any) {
      console.error("Failed to delete bookmark:", err)
      setErrorMessage("Failed to delete bookmark. Please try again.")
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredBookmarks = bookmarks.filter((b) => {
    if (!normalizedQuery) return true
    const titleMatch = (b.title || "").toLowerCase().includes(normalizedQuery)
    const urlMatch = (b.url || "").toLowerCase().includes(normalizedQuery)
    return titleMatch || urlMatch
  })

  return (
    <div style={styles.window}>
      <Header itemCount={bookmarks.length} onClose={onClose} />

      <div style={styles.controlsRow}>
        <button
          type="button"
          onClick={saveBookmark}
          disabled={isSaving}
          style={{
            ...styles.saveButton,
            ...(isSaving ? styles.saveButtonDisabled : {}),
          }}
        >
          {isSaving ? (
            <span style={styles.buttonContent}>
              <span style={styles.spinner} /> Saving...
            </span>
          ) : (
            <span style={styles.buttonContent}>
              <Plus size={16} />
              <span>Save Current Page</span>
              <span style={styles.shortcutBadge}>⌘S</span>
            </span>
          )}
        </button>

        {!loading && !loadError && bookmarks.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        )}
      </div>

      {successMessage && (
        <div style={styles.successBanner}>
          <Check size={14} /> <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={14} /> <span>{errorMessage}</span>
        </div>
      )}

      <div style={styles.filterRow}>
        <div style={styles.tabList}>
          <button type="button" style={styles.activeTab}>
            All
            <span style={styles.tabCount}>{filteredBookmarks.length}</span>
          </button>
        </div>

        {normalizedQuery !== "" && (
          <span style={styles.searchResultCount}>
            {filteredBookmarks.length}{" "}
            {filteredBookmarks.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      <main style={styles.contentArea}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <span style={styles.darkSpinner} />
            <span style={styles.loadingText}>Loading bookmarks...</span>
          </div>
        ) : loadError ? (
          <div style={styles.errorBanner}>
            <AlertTriangle size={14} /> {loadError}
          </div>
        ) : bookmarks.length === 0 ? (
          <EmptyState mode="empty" />
        ) : filteredBookmarks.length === 0 ? (
          <EmptyState mode="no-results" />
        ) : (
          <BookmarkGrid
            bookmarks={filteredBookmarks}
            onDelete={handleDeleteBookmark}
          />
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <Sparkles size={12} style={styles.sparkleIcon} />
          <span>Local Sync</span>
        </div>
        <div style={styles.footerRight}>
          <span>Press <kbd style={styles.kbd}>Esc</kbd> to close</span>
        </div>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  window: {
    width: "min(820px, calc(100vw - 48px))",
    height: "min(620px, calc(100vh - 48px))",
    backgroundColor: "rgba(13, 15, 20, 0.88)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow:
      "0 24px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)",
    padding: "20px 24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
    color: "#f3f4f6",
    animation: "fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    overflow: "hidden",
  },
  controlsRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  saveButton: {
    width: "100%",
    height: "40px",
    padding: "0 16px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  buttonContent: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
  },
  shortcutBadge: {
    fontSize: "11px",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: "2px 6px",
    borderRadius: "4px",
    marginLeft: "auto",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #ffffff",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  darkSpinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #818cf8",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  successBanner: {
    padding: "10px 14px",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorBanner: {
    padding: "10px 14px",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "4px",
  },
  tabList: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  activeTab: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#f3f4f6",
    backgroundColor: "rgba(99, 102, 241, 0.18)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tabCount: {
    fontSize: "11px",
    fontWeight: 500,
    color: "#818cf8",
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    padding: "1px 6px",
    borderRadius: "10px",
  },
  searchResultCount: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#9ca3af",
  },
  contentArea: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "40px 0",
  },
  loadingText: {
    fontSize: "13px",
    color: "#9ca3af",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    fontSize: "11px",
    color: "#6b7280",
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  sparkleIcon: {
    color: "#818cf8",
  },
  footerRight: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  kbd: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "3px",
    padding: "1px 4px",
    fontSize: "10px",
    fontFamily: "inherit",
    color: "#9ca3af",
  },
}
