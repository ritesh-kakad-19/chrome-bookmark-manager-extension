import React from "react"
import type { Bookmark } from "../types"
import { BookmarkGrid } from "./BookmarkGrid"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onDelete: (id: string) => void
}

export function BookmarkList({ bookmarks, onDelete }: BookmarkListProps) {
  return <BookmarkGrid bookmarks={bookmarks} onDelete={onDelete} />
}
