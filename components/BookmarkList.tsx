import React from "react"
import type { Bookmark } from "../types"
import { BookmarkCard } from "./BookmarkCard"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
}

export function BookmarkList({ bookmarks, onDelete }: BookmarkListProps) {
  // Sort newest first based on createdAt
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0
    const timeB = new Date(b.createdAt).getTime() || 0
    return timeB - timeA
  })

  return (
    <div style={styles.listContainer}>
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
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "380px",
    overflowY: "auto",
    paddingRight: "4px",
    marginRight: "-4px",
  },
}
