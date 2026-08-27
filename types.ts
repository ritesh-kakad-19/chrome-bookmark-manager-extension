export interface Bookmark {
  id: string
  title: string
  url: string
  createdAt: string
}

export interface StorageData {
  bookmarks?: Bookmark[]
}
