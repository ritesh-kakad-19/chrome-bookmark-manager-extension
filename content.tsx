import styleText from "data-text:./style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import React, { useEffect, useState } from "react"
import { BookmarkManager } from "./components/BookmarkManager"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

export default function ContentOverlay() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
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

  // BUG #2 FIX — Complete Background Page Scroll Lock
  useEffect(() => {
    if (!isOpen) return

    const savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    const originalBodyOverflow = document.body.style.overflow
    const originalDocOverflow = document.documentElement.style.overflow

    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    const preventScroll = (e: WheelEvent | TouchEvent) => {
      const path = e.composedPath()
      const isInsideScrollableGrid = path.some((el: EventTarget) => {
        if (el instanceof HTMLElement) {
          return el.classList.contains("grid-scrollbar")
        }
        return false
      })

      if (!isInsideScrollableGrid) {
        if (e.cancelable) {
          e.preventDefault()
        }
        e.stopPropagation()
      }
    }

    window.addEventListener("wheel", preventScroll, { passive: false })
    window.addEventListener("touchmove", preventScroll, { passive: false })

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalDocOverflow
      window.removeEventListener("wheel", preventScroll)
      window.removeEventListener("touchmove", preventScroll)
      window.scrollTo(0, savedScrollY)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden select-none"
      onClick={() => setIsOpen(false)}
    >
      {/* Ambient background glows */}
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full bg-indigo-600/20 blur-[80px] pointer-events-none" />

      <div onClick={(e) => e.stopPropagation()}>
        <BookmarkManager onClose={() => setIsOpen(false)} />
      </div>
    </div>
  )
}
