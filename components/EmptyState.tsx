import React from "react"
import { Bookmark, Search, Star } from "lucide-react"

interface EmptyStateProps {
  mode?: "empty" | "no-results" | "no-favorites"
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
  const isNoFavorites = mode === "no-favorites"

  const displayIcon =
    icon ||
    (isNoFavorites ? (
      <Star size={22} className="text-amber-400 fill-amber-400" />
    ) : isNoResults ? (
      <Search size={22} />
    ) : (
      <Bookmark size={22} />
    ))
  const displayTitle =
    title ||
    (isNoFavorites
      ? "No favorite bookmarks"
      : isNoResults
      ? "No bookmarks found"
      : "No bookmarks yet")
  const displaySubtitle =
    subtitle ||
    (isNoFavorites
      ? "Star your most useful bookmarks to find them quickly."
      : isNoResults
      ? "Try a different search term."
      : "Save your first webpage to see it here.")

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-900/40 border border-dashed border-white/10 rounded-2xl my-2 flex-1">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3.5 shadow-lg shadow-indigo-500/15">
        {displayIcon}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-100 mb-1">
        {displayTitle}
      </h3>
      <p className="text-[13px] text-slate-400 max-w-[260px] leading-relaxed">
        {displaySubtitle}
      </p>
    </div>
  )
}
