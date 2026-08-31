import React from "react"
import { Bookmark, X } from "lucide-react"

interface HeaderProps {
  itemCount: number
  onClose: () => void
}

export function Header({ itemCount, onClose }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-3.5 border-b border-white/10">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/25 to-blue-600/15 border border-indigo-500/35 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-indigo-400 shrink-0">
          <Bookmark size={20} className="text-indigo-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[17px] font-semibold text-slate-100 tracking-tight">
              Bookmark Manager
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-medium text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-[12px] text-slate-400">
            Your saved web, organized.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-150 flex items-center justify-center cursor-pointer"
        aria-label="Close Bookmark Manager"
        title="Close (Esc)"
      >
        <X size={16} />
      </button>
    </header>
  )
}
