import React from "react"
import type { Bookmark } from "../types"
import { BookmarkGrid } from "./BookmarkGrid"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function BookmarkList({
  bookmarks,
  onDelete,
  onToggleFavorite,
}: BookmarkListProps) {
  return (
    <BookmarkGrid
      bookmarks={bookmarks}
      onDelete={onDelete}
      onToggleFavorite={onToggleFavorite}
    />
  )
}
