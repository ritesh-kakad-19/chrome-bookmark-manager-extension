import React from "react"
import type { Bookmark } from "../types"
import { BookmarkCard } from "./BookmarkCard"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
}

export function BookmarkGrid({ bookmarks, onDelete }: BookmarkGridProps) {
  // Sort newest first based on createdAt
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0
    const timeB = new Date(b.createdAt).getTime() || 0
    return timeB - timeA
  })

  return (
    <div style={styles.gridContainer}>
      {sortedBookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "12px",
    maxHeight: "380px",
    overflowY: "auto",
    paddingRight: "6px",
    marginRight: "-6px",
  },
}
