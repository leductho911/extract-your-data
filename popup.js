document.getElementById("extractButton").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Get user inputs or use defaults
    const regexInput = document.getElementById("regexInput").value || "C\\d{2,4}";
    const separatorInput = document.getElementById("separatorInput").value || " or ";

    // Save user preferences to Chrome storage
    chrome.storage.sync.set({ regex: regexInput, separator: separatorInput });

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: (regexStr) => {
                const regex = new RegExp(regexStr, "g"); // Convert string to RegExp
                const matches = [...document.body.innerText.matchAll(regex)];
                return matches.map(match => match[0]);
            },
            args: [regexInput] // Pass the regex input
        },
        (results) => {
            if (results && results[0] && results[0].result) {
                const data = results[0].result;
                const resultDiv = document.getElementById("result");
                const copyButton = document.getElementById("copyButton");

                // Use the separator from storage or default
                if (data.length > 0) {
                    resultDiv.textContent = data.join(separatorInput);
                    resultDiv.style.display = "block";
                    copyButton.style.display = "inline-block";

                    copyButton.addEventListener("click", () => {
                        navigator.clipboard.writeText(data.join(separatorInput));
                        copyButton.textContent = "Copied!";
                        setTimeout(() => {
                            copyButton.textContent = "Copy";
                        }, 2000);
                    });
                } else {
                    resultDiv.textContent = "No matching data found.";
                    resultDiv.style.display = "block";
                    copyButton.style.display = "none";
                }
            }
        }
    );
});

// Load saved settings when the popup opens
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["regex", "separator"], (settings) => {
        document.getElementById("regexInput").value = settings.regex || "C\\d{2,4}";
        document.getElementById("separatorInput").value = settings.separator || " or ";
    });
});