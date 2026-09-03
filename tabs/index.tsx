import "../style.css"
import React from "react"
import { BookmarkManager } from "../components/BookmarkManager"

export default function IndexTab() {
  const handleClose = () => {
    if (typeof chrome !== "undefined" && chrome.tabs?.getCurrent) {
      chrome.tabs.getCurrent((tab) => {
        if (tab?.id) {
          chrome.tabs.remove(tab.id)
        } else {
          window.close()
        }
      })
    } else {
      window.close()
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen min-h-screen bg-[#020817] flex items-center justify-center p-6 text-slate-100 font-sans overflow-hidden select-none z-0">
      {/* Deep gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061426] via-[#020817] to-[#020817] pointer-events-none" />

      {/* 1. Top-left: soft indigo/purple glow */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />

      {/* 2. Top-right: soft blue glow */}
      <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />

      {/* 3. Bottom-left: soft purple glow */}
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple-600/18 blur-[130px] pointer-events-none" />

      {/* 4. Bottom-right: subtle cyan glow */}
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />

      {/* Centered Bookmark Manager UI */}
      <div className="relative z-10">
        <BookmarkManager onClose={handleClose} />
      </div>
    </div>
  )
}
