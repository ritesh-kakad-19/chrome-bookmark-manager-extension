import React from "react"
import { AnimatePresence } from "framer-motion"
import type { Bookmark } from "../types"
import { BookmarkCard } from "./BookmarkCard"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  searchQuery?: string
}

export function BookmarkGrid({
  bookmarks,
  onDelete,
  onToggleFavorite,
  searchQuery = "",
}: BookmarkGridProps) {
  // Sort newest first based on createdAt
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0
    const timeB = new Date(b.createdAt).getTime() || 0
    return timeB - timeA
  })

  return (
    <div className="grid grid-cols-2 gap-3.5 overflow-y-auto max-h-[360px] pr-1.5 -mr-1.5 grid-scrollbar">
      <AnimatePresence mode="sync">
        {sortedBookmarks.map((bookmark) => (
          <BookmarkCard
            key={`${searchQuery}-${bookmark.id}`}
            bookmark={bookmark}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
