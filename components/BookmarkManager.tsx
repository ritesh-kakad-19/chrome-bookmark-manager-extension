import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Plus, AlertTriangle, Sparkles } from "lucide-react"
import type { Bookmark, StorageData } from "../types"
import { BookmarkGrid } from "./BookmarkGrid"
import { EmptyState } from "./EmptyState"
import { Header } from "./Header"
import { SearchBar } from "./SearchBar"

interface BookmarkManagerProps {
  onClose: () => void
}

type FilterTab = "all" | "recent"

export function BookmarkManager({ onClose }: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

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
      let activeTabInfo: chrome.tabs.Tab | null = null

      if (chrome?.tabs?.query) {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (tabs && tabs.length > 0) {
          activeTabInfo = tabs[0]
        }
      }

      const currentUrl =
        activeTabInfo?.url || (typeof window !== "undefined" ? window.location.href : "")
      const currentTitle =
        activeTabInfo?.title || (typeof document !== "undefined" ? document.title : "Untitled")

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
      setTimeout(() => setSuccessMessage(""), 3000)
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

  // Filter bookmarks
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredBookmarks = bookmarks.filter((b) => {
    // Search query filter
    if (normalizedQuery) {
      const titleMatch = (b.title || "").toLowerCase().includes(normalizedQuery)
      const urlMatch = (b.url || "").toLowerCase().includes(normalizedQuery)
      if (!titleMatch && !urlMatch) return false
    }

    // Tab filter
    if (activeTab === "recent") {
      const created = new Date(b.createdAt).getTime() || 0
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      return created >= oneDayAgo
    }

    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col w-[min(820px,calc(100vw-48px))] h-[min(620px,calc(100vh-48px))] rounded-3xl border border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-2xl shadow-black/80 p-6 gap-4 font-sans text-slate-100 overflow-hidden select-none"
    >
      <Header itemCount={bookmarks.length} onClose={onClose} />

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={saveBookmark}
          disabled={isSaving}
          className="w-full h-11 px-4 text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-60 border border-white/15 rounded-xl transition-all duration-150 shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin-custom" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 w-full">
              <Plus size={18} />
              <span>Save Current Page</span>
              <span className="ml-auto text-[11px] font-medium text-white/90 bg-white/20 px-2 py-0.5 rounded-md leading-none">
                ⌘S
              </span>
            </span>
          )}
        </button>

        {!loading && !loadError && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        )}
      </div>

      {successMessage && (
        <div className="px-3.5 py-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-[13px] font-medium flex items-center gap-2">
          <Check size={14} /> <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="px-3.5 py-2.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl text-[13px] font-medium flex items-center gap-2">
          <AlertTriangle size={14} /> <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[12.5px] font-medium rounded-full border transition-all cursor-pointer ${
              activeTab === "all"
                ? "text-white font-semibold bg-indigo-500/20 border-indigo-500/40 shadow-sm shadow-indigo-500/15"
                : "text-slate-400 bg-white/5 border-white/10 hover:text-slate-200"
            }`}
          >
            <span>All</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === "all"
                  ? "text-indigo-300 bg-indigo-500/30"
                  : "text-slate-400 bg-white/10"
              }`}
            >
              {bookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[12.5px] font-medium rounded-full border transition-all cursor-pointer ${
              activeTab === "recent"
                ? "text-white font-semibold bg-indigo-500/20 border-indigo-500/40 shadow-sm shadow-indigo-500/15"
                : "text-slate-400 bg-white/5 border-white/10 hover:text-slate-200"
            }`}
          >
            <span>Recent</span>
          </button>
        </div>

        {normalizedQuery !== "" && (
          <span className="text-[12px] font-medium text-slate-400">
            {filteredBookmarks.length}{" "}
            {filteredBookmarks.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2.5 py-16">
            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin-custom" />
            <span className="text-[13.5px] text-slate-400">Loading bookmarks...</span>
          </div>
        ) : loadError ? (
          <div className="px-3.5 py-2.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl text-[13px] font-medium flex items-center gap-2">
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
            searchQuery={searchQuery}
          />
        )}
      </main>

      <footer className="flex items-center justify-between pt-3 border-t border-white/10 text-[12px] text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles size={13} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12.5px] font-semibold text-slate-200">
              Local Sync
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              <span className="text-[11px] text-slate-400">
                All bookmarks stored locally
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <span>Press</span>
          <kbd className="px-2 py-0.5 text-[11px] font-medium text-slate-200 bg-white/10 border border-white/15 rounded-md leading-none">
            Esc
          </kbd>
          <span>to close</span>
        </div>
      </footer>
    </motion.div>
  )
}
