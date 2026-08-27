import { useEffect, useState } from "react"
import { BookmarkList } from "./components/BookmarkList"
import { EmptyState } from "./components/EmptyState"
import { SearchInput } from "./components/SearchInput"
import type { Bookmark, StorageData } from "./types"

export default function Popup() {
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

    // Listen for storage changes across windows/views
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
      if (!chrome?.tabs?.query) {
        throw new Error("Chrome tabs API is unavailable.")
      }

      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (!tabs || tabs.length === 0) {
        setErrorMessage("No active tab found.")
        setIsSaving(false)
        return
      }

      const activeTab = tabs[0]

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

      if (!activeTab || isInvalidUrl(activeTab.url)) {
        setErrorMessage("Cannot save blank or internal browser pages.")
        setIsSaving(false)
        return
      }

      // Read existing bookmarks from storage
      const result: StorageData = await chrome.storage.local.get("bookmarks")
      const existingBookmarks: Bookmark[] = result.bookmarks || []

      // Check for duplicate URL
      const isDuplicate = existingBookmarks.some(
        (b) => b.url === activeTab.url
      )

      if (isDuplicate) {
        setErrorMessage("Bookmark already saved.")
        setIsSaving(false)
        return
      }

      // Create new bookmark object
      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString()

      const newBookmark: Bookmark = {
        id,
        title: activeTab.title || "Untitled",
        url: activeTab.url,
        createdAt: new Date().toISOString(),
      }

      const updatedBookmarks = [newBookmark, ...existingBookmarks]

      // Save back to chrome.storage.local
      await chrome.storage.local.set({
        bookmarks: updatedBookmarks,
      })

      // Update local state immediately
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
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerTitleRow}>
          <h1 style={styles.title}>🔖 Bookmark Manager</h1>
          {!loading && (
            <span style={styles.badge}>
              {bookmarks.length} {bookmarks.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </header>

      <main style={styles.content}>
        <button
          type="button"
          onClick={saveBookmark}
          disabled={isSaving}
          style={{
            ...styles.button,
            ...(isSaving ? styles.buttonDisabled : {}),
          }}
        >
          {isSaving ? (
            <span style={styles.buttonContent}>
              <span style={styles.spinner} /> Saving...
            </span>
          ) : (
            "Save Current Page"
          )}
        </button>

        {successMessage && (
          <div style={styles.successBanner}>
            <span style={styles.icon}>✓</span> {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={styles.errorBanner}>
            <span style={styles.icon}>⚠️</span> {errorMessage}
          </div>
        )}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Saved Bookmarks</h2>
            {normalizedQuery !== "" && (
              <span style={styles.searchResultCount}>
                {filteredBookmarks.length}{" "}
                {filteredBookmarks.length === 1 ? "result" : "results"}
              </span>
            )}
          </div>

          {!loading && !loadError && bookmarks.length > 0 && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
          )}

          {loading ? (
            <div style={styles.loadingContainer}>
              <span style={styles.darkSpinner} />
              <span style={styles.loadingText}>Loading bookmarks...</span>
            </div>
          ) : loadError ? (
            <div style={styles.errorBanner}>
              <span style={styles.icon}>⚠️</span> {loadError}
            </div>
          ) : bookmarks.length === 0 ? (
            <EmptyState mode="empty" />
          ) : filteredBookmarks.length === 0 ? (
            <EmptyState mode="no-results" />
          ) : (
            <BookmarkList
              bookmarks={filteredBookmarks}
              onDelete={handleDeleteBookmark}
            />
          )}
        </section>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "380px",
    padding: "18px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    color: "#1f2937",
  },
  header: {
    marginBottom: "14px",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "10px",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "17px",
    fontWeight: "700",
    margin: "0",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "2px 8px",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  button: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  buttonContent: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    border: "2px solid #ffffff",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  darkSpinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #3b82f6",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  successBanner: {
    padding: "10px 12px",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorBanner: {
    padding: "10px 12px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  icon: {
    fontSize: "14px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#4b5563",
    margin: "0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  searchResultCount: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b7280",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "24px 0",
  },
  loadingText: {
    fontSize: "13px",
    color: "#6b7280",
  },
}