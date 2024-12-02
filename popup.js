document.addEventListener("DOMContentLoaded", () => {
    // Load the saved default regex and separator from storage
    chrome.storage.sync.get(["defaultRegex", "defaultSeparator"], (settings) => {
        document.getElementById("regexInput").value = settings.defaultRegex || "C\\d{2,4}";
        document.getElementById("separatorInput").value = settings.defaultSeparator || " or ";
    });
});

document.getElementById("extractButton").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Load regex and separator input values
    const regexInput = document.getElementById("regexInput").value;
    const separatorInput = document.getElementById("separatorInput").value;

    // Validate regex
    try {
        new RegExp(regexInput); // Validate the regex
        document.getElementById("regexError").style.display = "none"; // Hide error if valid
    } catch (e) {
        document.getElementById("regexError").style.display = "inline"; // Show error if invalid
        return; // Stop execution if regex is invalid
    }

    // Save user inputs temporarily
    chrome.storage.sync.set({ regex: regexInput, separator: separatorInput });

    // Extract matching text
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: (regexStr) => {
                const regex = new RegExp(regexStr, "g");
                const matches = [...document.body.innerText.matchAll(regex)];
                return matches.map((match) => match[0]);
            },
            args: [regexInput]
        },
        (results) => {
            if (results && results[0] && results[0].result) {
                const data = results[0].result;
                const resultDiv = document.getElementById("result");
                const copyButton = document.getElementById("copyButton");

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