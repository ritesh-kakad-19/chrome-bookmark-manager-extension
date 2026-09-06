export interface Bookmark {
  id: string
  title: string
  url: string
  createdAt: string
  isFavorite?: boolean
}

export interface StorageData {
  bookmarks?: Bookmark[]
}

