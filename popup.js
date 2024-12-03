document.addEventListener("DOMContentLoaded", () => {
    // Load the saved default regex and separator from storage
    chrome.storage.sync.get(["defaultRegex", "defaultSeparator"], (settings) => {
        document.getElementById("regexInput").value = settings.defaultRegex || "C\\d{2,4}";
        document.getElementById("separatorInput").value = settings.defaultSeparator || " or ";
    });

    // Check if any text was selected via context menu
    chrome.storage.local.get("selectedText", (result) => {
        const selectedText = result.selectedText || "";
        if (selectedText) {
            extractFromSelectedText(selectedText);

            // Clear the selectedText after use
            chrome.storage.local.remove("selectedText");
        }
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

    // Extract matching text from the page
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: (regexStr) => {
                const regex = new RegExp(regexStr, "g");
                const matches = [...document.body.innerText.matchAll(regex)];
                return matches.map((match) => match[0]);
            },
            args: [regexInput],
        },
        (results) => {
            if (results && results[0] && results[0].result) {
                displayResults(results[0].result, separatorInput);
            }
        }
    );
});

// Function to extract data from selected text
function extractFromSelectedText(selectedText) {
    const regexInput = document.getElementById("regexInput").value;
    const separatorInput = document.getElementById("separatorInput").value;

    try {
        const regex = new RegExp(regexInput, "g");
        const matches = [...selectedText.matchAll(regex)];
        const extractedData = matches.map((match) => match[0]);
        displayResults(extractedData, separatorInput);
    } catch (e) {
        document.getElementById("regexError").style.display = "inline"; // Show error if regex is invalid
    }
}

// Function to display results in the popup
function displayResults(data, separator) {
    const resultDiv = document.getElementById("result");
    const copyButton = document.getElementById("copyButton");

    if (data.length > 0) {
        resultDiv.textContent = data.join(separator);
        resultDiv.style.display = "block";
        copyButton.style.display = "inline-block";

        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(data.join(separator));
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