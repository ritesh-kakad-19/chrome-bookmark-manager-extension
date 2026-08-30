export {}

chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_BOOKMARK_MANAGER" })
    } catch (err) {
      console.warn("Could not send toggle message to active tab:", err)
    }
  }
})
