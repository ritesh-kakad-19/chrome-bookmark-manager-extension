import React, { useState } from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      e.stopPropagation()
      onClear()
    }
  }

  return (
    <div
      style={{
        ...styles.wrapper,
        ...(isFocused ? styles.wrapperFocused : {}),
      }}
    >
      <Search size={15} style={styles.searchIcon} aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search bookmarks..."
        aria-label="Search bookmarks"
        style={styles.input}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={styles.clearButton}
          title="Clear search"
        >
          <X size={13} />
        </button>
      ) : (
        <span style={styles.shortcutKey}>⌘K</span>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(22, 25, 34, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "0 12px",
    height: "40px",
    transition: "all 0.15s ease",
    boxSizing: "border-box",
    width: "100%",
  },
  wrapperFocused: {
    backgroundColor: "rgba(26, 30, 42, 0.85)",
    borderColor: "rgba(99, 102, 241, 0.6)",
    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
  },
  searchIcon: {
    color: "#9ca3af",
    marginRight: "10px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13.5px",
    color: "#f3f4f6",
    width: "100%",
    padding: 0,
    margin: 0,
    fontFamily: "inherit",
  },
  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    padding: 0,
    margin: 0,
    background: "rgba(255, 255, 255, 0.06)",
    border: "none",
    borderRadius: "50%",
    color: "#9ca3af",
    cursor: "pointer",
    flexShrink: 0,
    marginLeft: "8px",
    transition: "all 0.15s ease",
  },
  shortcutKey: {
    fontSize: "11px",
    fontWeight: 500,
    color: "#6b7280",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
    padding: "2px 6px",
    lineHeight: 1,
    flexShrink: 0,
    marginLeft: "8px",
  },
}
