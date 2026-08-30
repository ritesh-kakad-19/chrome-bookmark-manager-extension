import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"
import { BookmarkManager } from "./components/BookmarkManager"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

export default function ContentOverlay() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    // Listen for messages from background script when action icon is clicked
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message?.type === "TOGGLE_BOOKMARK_MANAGER") {
        setIsOpen((prev) => !prev)
        sendResponse({ success: true })
      }
    }

    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener)
    }

    return () => {
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener)
      }
    }
  }, [])

  useEffect(() => {
    // Keyboard shortcuts: Alt+B or Cmd+K / Ctrl+K to toggle, Esc to close
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      if (isCmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={styles.backdrop} onClick={() => setIsOpen(false)}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      <div style={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        <BookmarkManager onClose={() => setIsOpen(false)} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(4, 5, 8, 0.75)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    zIndex: 2147483647,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
  },
  modalWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}
