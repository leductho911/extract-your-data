// Load saved settings when the page loads
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["defaultRegex", "defaultSeparator"], (settings) => {
        document.getElementById("defaultRegex").value = settings.defaultRegex || "C\\d{2,4}";
        document.getElementById("defaultSeparator").value = settings.defaultSeparator || " or ";
    });
});

// Save settings when the "Save" button is clicked
document.getElementById("saveButton").addEventListener("click", () => {
    const defaultRegex = document.getElementById("defaultRegex").value || "C\\d{2,4}";
    const defaultSeparator = document.getElementById("defaultSeparator").value || " or ";

    // Save settings in Chrome's sync storage
    chrome.storage.sync.set({ defaultRegex, defaultSeparator }, () => {
        const statusMessage = document.getElementById("statusMessage");
        statusMessage.textContent = "Settings saved!";
        statusMessage.style.display = "block";

        setTimeout(() => {
            statusMessage.style.display = "none";
        }, 2000);
    });
});