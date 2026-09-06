# Extension Architecture & Data Flow Guide

This document provides a detailed breakdown of the **Bookmark Manager Chrome Extension** architecture, user interaction flows, data pipeline, component hierarchy, and real-time synchronization mechanisms.

---

## 🗺️ System Architecture Overview

The extension is built using **Plasmo (Manifest V3)**, **React**, **TypeScript**, and **Tailwind CSS**. It operates across three distinct Chrome extension execution contexts:

1. **Background Service Worker ([background.ts](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/background.ts))**: Background event hub handling extension clicks, tab URL inspection, and context routing.
2. **Content Script Overlay ([content.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/content.tsx))**: Injected into web pages to display an in-page glassmorphism overlay modal.
3. **Standalone Extension Tab ([tabs/index.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/tabs/index.tsx))**: Full-page tab fallback when operating on restricted browser pages where content scripts cannot run.
4. **Storage Layer (`chrome.storage.local`)**: Central persistent storage for user bookmarks with real-time change events.

```mermaid
graph TD
    subgraph BrowserContext ["Browser Context"]
        ActionClick["User Clicks Extension Icon"]
        KeyboardShortcut["Hotkey Pressed (Cmd+K / Alt+B)"]
    end

    subgraph ServiceWorker ["Background Service Worker (background.ts)"]
        UrlChecker{"Is URL Restricted?"}
        SendMsg["Send TOGGLE_BOOKMARK_MANAGER"]
        OpenTab["Open / Focus tabs/index.html"]
    end

    subgraph ContentContext ["Web Page Context"]
        ContentScript["Content Script Overlay (content.tsx)"]
        ScrollLock["Scroll Lock Mechanism"]
        ModalUI["React Modal (BookmarkManager.tsx)"]
    end

    subgraph StandaloneContext ["Extension Tab Context"]
        ExtensionPage["Extension Tab (tabs/index.tsx)"]
        FullUI["React Page (BookmarkManager.tsx)"]
    end

    subgraph StorageLayer ["Chrome Storage API"]
        LocalStorage[("chrome.storage.local ['bookmarks']")]
        StorageEvent["chrome.storage.onChanged"]
    end

    subgraph ExternalServices ["External APIs"]
        FaviconAPI["Google Favicon API"]
    end

    ActionClick --> UrlChecker
    KeyboardShortcut --> ContentScript

    UrlChecker -- "No (Normal Webpage)" --> SendMsg
    UrlChecker -- "Yes (chrome://, DevTools, etc.)" --> OpenTab

    SendMsg --> ContentScript
    ContentScript --> ScrollLock
    ContentScript --> ModalUI

    OpenTab --> ExtensionPage
    ExtensionPage --> FullUI

    ModalUI <--> LocalStorage
    FullUI <--> LocalStorage

    LocalStorage -. "Emits Updates" .-> StorageEvent
    StorageEvent -. "Updates UI State" .-> ModalUI
    StorageEvent -. "Updates UI State" .-> FullUI

    ModalUI --> FaviconAPI
    FullUI --> FaviconAPI
```

---

## ⚡ Extension Launch & Context Routing Flow

When the user triggers the extension, the background worker determines whether to launch the overlay inside the active tab or direct the user to a standalone tab.

### Flow Logic:
1. User clicks the extension action icon in the Chrome toolbar.
2. `background.ts` receives `chrome.action.onClicked`.
3. Checks if the active tab is already the extension tab or a restricted browser URL (`chrome://`, `edge://`, `about:`, `chrome.google.com/webstore`).
4. **If Restricted Page**: Creates or switches to `tabs/index.html`.
5. **If Normal Webpage**: Sends runtime message `{ type: "TOGGLE_BOOKMARK_MANAGER" }` to `content.tsx`.

```mermaid
flowchart TD
    A["User triggers extension"] --> B{"Trigger Source?"}
    B -- "Keyboard Shortcut (Cmd+K / Alt+B)" --> C["Content Script handles event directly"]
    B -- "Toolbar Action Icon Click" --> D["background.ts (onClicked)"]

    D --> E{"Is Tab URL Restricted?"}
    E -- "Yes (chrome://, Webstore, etc.)" --> F{"Extension tab already open?"}
    F -- "Yes" --> G["Focus existing extension tab"]
    F -- "No" --> H["Create new tab: tabs/index.html"]

    E -- "No (Normal Web Page)" --> I["SendMessage to active tab (TOGGLE_BOOKMARK_MANAGER)"]
    I --> J["Content script receives message"]
    
    C --> K["Toggle isOpen State"]
    J --> K

    K --> L{"isOpen == true?"}
    L -- "Yes" --> M["Enable Scroll Lock & Render Modal Overlay"]
    L -- "No" --> N["Disable Scroll Lock & Unmount Modal"]
```

---

## 💾 Data Flow: Saving a Bookmark

Saving a bookmark involves active tab querying, URL validation, duplicate checking, UUID generation, local storage persistence, and real-time state synchronization.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as BookmarkManager Component
    participant ChromeTabs as chrome.tabs API
    participant ChromeStorage as chrome.storage.local
    participant StorageListener as chrome.storage.onChanged

    User->>UI: Clicks "Save Current Page" (or Cmd+S)
    UI->>UI: Set isSaving = true
    UI->>ChromeTabs: query({ active: true, currentWindow: true })
    ChromeTabs-->>UI: Returns activeTab object (url, title)
    
    alt Invalid URL (chrome://, about:blank)
        UI-->>User: Show Error ("Cannot save blank or internal browser pages")
    else Valid URL
        UI->>ChromeStorage: get("bookmarks")
        ChromeStorage-->>UI: Returns existing bookmarks array
        
        alt Duplicate URL exists
            UI-->>User: Show Error ("Bookmark already saved")
        else Unique URL
            UI->>UI: Generate UUID & timestamp (ISO string)
            UI->>UI: Construct new Bookmark object
            UI->>ChromeStorage: set({ bookmarks: [newBookmark, ...existing] })
            ChromeStorage-->>UI: Save Acknowledged
            ChromeStorage--)StorageListener: Emit onChanged event
            StorageListener--)UI: Update bookmarks state automatically
            UI-->>User: Show Success ("Bookmark saved successfully")
        end
    end
    UI->>UI: Set isSaving = false
```

---

## 🔄 Real-Time Storage Synchronization Flow

Because bookmarks can be saved or deleted from multiple tabs or overlay instances, the extension utilizes `chrome.storage.onChanged` to maintain synchronized state across all active contexts.

```mermaid
flowchart LR
    subgraph Tab1 ["Tab A (Webpage Overlay)"]
        UI_A["BookmarkManager UI"]
    end

    subgraph Tab2 ["Tab B (Extension Tab)"]
        UI_B["BookmarkManager UI"]
    end

    subgraph Storage ["Chrome Local Storage"]
        DB[("chrome.storage.local")]
    end

    UI_A -- "1. Delete / Save Bookmark" --> DB
    DB -- "2. Trigger Storage Change" --> Sync["chrome.storage.onChanged Event"]
    Sync -- "3. Update State" --> UI_A
    Sync -- "3. Update State" --> UI_B
```

---

## 🧩 Component Hierarchy & Responsibilities

```
BookmarkManager (Container & State Controller)
├── Header (Title, Item Counter Badge, Close Button)
├── SearchBar (Search input with clear button & ⌘K shortcut trigger)
├── Category Tabs ("All" / "Recent" filter buttons)
├── Main Content Area
│   ├── Loading State (Spinner)
│   ├── Error Banner (Load / Delete Error alert)
│   ├── EmptyState ("No bookmarks yet" / "No search results")
│   └── BookmarkGrid (2-column responsive layout, grid scrollbar)
│       └── BookmarkCard (Framer Motion card, Google Favicon API, Delete confirm)
└── Footer (Local sync status badge, Esc key legend)
```

| Component | File Link | Responsibilities |
| :--- | :--- | :--- |
| **BookmarkManager** | [BookmarkManager.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/components/BookmarkManager.tsx) | Handles state management, Chrome storage read/write, filtering, and tab switching. |
| **BookmarkCard** | [BookmarkCard.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/components/BookmarkCard.tsx) | Displays bookmark tile, fetches domain favicon, relative time calculation, tab opening, delete confirmation state. |
| **BookmarkGrid** | [BookmarkGrid.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/components/BookmarkGrid.tsx) | Grid layout with `AnimatePresence` for smooth exit/entrance animations. |
| **Header** | [Header.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/components/Header.tsx) | Displays branding, count badge, and trigger close callback. |
| **SearchBar** | [SearchBar.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/components/SearchBar.tsx) | Controlled input for real-time title & URL filtering. |
| **EmptyState** | [EmptyState.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/components/EmptyState.tsx) | Renders contextual empty screens for 0 bookmarks vs 0 search results. |
| **dateUtils** | [dateUtils.ts](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/utils/dateUtils.ts) | Utility logic for converting ISO timestamps to relative strings (e.g. `Saved 5m ago`). |

---

## 🔒 Scroll Lock Mechanism ([content.tsx](file:///c:/Users/ASUS/Desktop/Projects/bookmark-manager/bookmark-manager/content.tsx))

When the overlay modal opens on a webpage, `content.tsx` prevents background page scrolling while retaining internal scrollability within the bookmark grid:

1. **Locks page overflow**: Sets `document.body.style.overflow = "hidden"` and `document.documentElement.style.overflow = "hidden"`.
2. **Intercepts Wheel & Touch Events**: Captures `wheel` and `touchmove` events at the window level.
3. **Checks Event Target Path**: Inspects `e.composedPath()` for elements containing `.grid-scrollbar`.
4. **Conditional Prevention**: If the event originated outside the scrollable grid container, `e.preventDefault()` is called to prevent background page movement.
