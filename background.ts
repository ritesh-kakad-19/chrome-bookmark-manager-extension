export {}

function isRestrictedUrl(url?: string): boolean {
  if (!url) return true
  const lower = url.trim().toLowerCase()
  return (
    lower.startsWith("chrome://") ||
    lower.startsWith("chrome-extension://") ||
    lower.startsWith("edge://") ||
    lower.startsWith("about:") ||
    lower.startsWith("view-source:") ||
    lower.startsWith("https://chrome.google.com/webstore") ||
    lower.startsWith("https://chromewebstore.google.com") ||
    lower.startsWith("devtools://")
  )
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return

  const extensionUrlPrefix = chrome.runtime.getURL("")
  const fallbackTabUrl = chrome.runtime.getURL("tabs/index.html")

  // Case 3: If active tab is ALREADY our extension page
  if (tab.url && tab.url.startsWith(extensionUrlPrefix)) {
    try {
      await chrome.tabs.update(tab.id, { active: true })
    } catch (err) {
      console.warn("Error focusing extension tab:", err)
    }
    return
  }

  // Case 2: Chrome Restricted Page
  if (isRestrictedUrl(tab.url)) {
    try {
      const existingTabs = await chrome.tabs.query({
        url: fallbackTabUrl,
        currentWindow: true,
      })

      if (existingTabs.length > 0 && existingTabs[0].id) {
        await chrome.tabs.update(existingTabs[0].id, { active: true })
      } else {
        await chrome.tabs.create({ url: fallbackTabUrl })
      }
    } catch (err) {
      console.error("Failed to open fallback extension tab:", err)
    }
    return
  }

  // Case 1: Normal Webpage
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_BOOKMARK_MANAGER" })
  } catch (err) {
    console.warn("Could not send toggle message to active tab:", err)
  }
})
