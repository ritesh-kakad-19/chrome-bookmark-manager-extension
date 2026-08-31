import React from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      e.stopPropagation()
      onClear()
    }
  }

  return (
    <div className="relative flex items-center w-full h-10 px-3.5 bg-slate-900/60 border border-white/10 rounded-xl transition-all duration-150 focus-within:border-indigo-500/60 focus-within:bg-slate-900/90 focus-within:shadow-md focus-within:shadow-indigo-500/10">
      <Search size={15} className="text-slate-400 mr-2.5 shrink-0" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search bookmarks..."
        aria-label="Search bookmarks"
        className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-slate-100 placeholder-slate-400 font-sans"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-2"
          title="Clear search"
        >
          <X size={12} />
        </button>
      ) : (
        <span className="px-1.5 py-0.5 text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10 rounded-md leading-none ml-2">
          ⌘K
        </span>
      )}
    </div>
  )
}
