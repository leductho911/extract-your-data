chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "extract-data",
        title: "Extract Your Data",
        contexts: ["selection"] // Show only when text is selected
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "extract-data" && info.selectionText) {
        // Save selected text to local storage
        chrome.storage.local.set({ selectedText: info.selectionText }, () => {
            chrome.action.openPopup(); // Open the popup
        });
    }
});