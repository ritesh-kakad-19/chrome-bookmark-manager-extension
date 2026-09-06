import React, { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ExternalLink, Globe, Star, Trash2 } from "lucide-react"
import type { Bookmark } from "../types"
import { formatRelativeDate } from "../utils/dateUtils"

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function BookmarkCard({
  bookmark,
  onDelete,
  onToggleFavorite,
}: BookmarkCardProps) {
  const [faviconError, setFaviconError] = useState<boolean>(false)
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const shouldReduceMotion = useReducedMotion()

  const isFavorite = Boolean(bookmark.isFavorite)

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
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (chrome?.tabs?.create && bookmark.url) {
      chrome.tabs.create({ url: bookmark.url })
    } else if (bookmark.url) {
      window.open(bookmark.url, "_blank")
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(bookmark.id)
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
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className="relative flex flex-col justify-between p-4 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md transition-colors transition-shadow duration-150 ease-out hover:border-indigo-500/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-indigo-500/10 min-w-0 box-border"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          {!faviconError ? (
            <img
              src={faviconUrl}
              alt=""
              onError={() => setFaviconError(true)}
              className="w-4 h-4 rounded-sm object-contain"
            />
          ) : (
            <Globe size={16} className="text-indigo-400" />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <h4
            className="text-[13.5px] font-semibold text-slate-100 truncate leading-snug"
            title={bookmark.title || "Untitled"}
          >
            {bookmark.title || "Untitled"}
          </h4>
          <span
            className="text-[11.5px] text-slate-400 truncate mt-0.5"
            title={bookmark.url}
          >
            {hostname}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
        {!isConfirming ? (
          <>
            <span className="text-[11.5px] text-slate-400">{formattedDate}</span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpen}
                className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-200 transition-colors duration-150 flex items-center gap-1 cursor-pointer"
                aria-label="Open bookmark in new tab"
                title="Open in new tab"
              >
                <span>Open</span>
                <ExternalLink size={11} />
              </button>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`p-1.5 border rounded-lg transition-colors duration-150 flex items-center justify-center cursor-pointer ${
                  isFavorite
                    ? "text-amber-400 bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/20 hover:border-amber-400/50"
                    : "text-slate-400 hover:text-amber-300 hover:bg-amber-400/10 hover:border-amber-400/30 border-white/10 bg-white/5"
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  size={13}
                  className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
                />
              </button>
              <button
                type="button"
                onClick={handleInitiateDelete}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-white/10 bg-white/5 rounded-lg transition-colors duration-150 flex items-center justify-center cursor-pointer"
                aria-label="Delete bookmark"
                title="Delete bookmark"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11.5px] font-medium text-rose-400">Delete?</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2 py-0.5 text-[11px] font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-colors duration-150 cursor-pointer"
                aria-label="Confirm deletion"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-white/5 border border-white/10 rounded-md transition-colors duration-150 cursor-pointer"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
