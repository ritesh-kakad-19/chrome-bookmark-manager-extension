import React, { useState } from "react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchInput({ value, onChange, onClear }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      onClear()
    }
  }

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.inputWrapper,
          ...(isFocused ? styles.inputWrapperFocused : {}),
        }}
      >
        <span style={styles.searchIconContainer} aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={styles.iconSvg}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

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

        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            style={styles.clearButton}
            title="Clear search"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0 10px",
    height: "36px",
    transition: "all 0.15s ease",
    boxSizing: "border-box",
  },
  inputWrapperFocused: {
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.15)",
  },
  searchIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    marginRight: "8px",
    flexShrink: 0,
  },
  iconSvg: {
    display: "block",
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    color: "#111827",
    width: "100%",
    padding: 0,
    margin: 0,
  },
  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    margin: 0,
    background: "transparent",
    border: "none",
    borderRadius: "50%",
    color: "#6b7280",
    cursor: "pointer",
    lineHeight: 1,
    flexShrink: 0,
    marginLeft: "4px",
    transition: "color 0.15s ease, background-color 0.15s ease",
  },
}
