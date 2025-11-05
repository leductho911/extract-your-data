document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["defaultRegex", "defaultSeparator"], (settings) => {
        document.getElementById("regexInput").value = settings.defaultRegex || "C\\d{2,4}";
        document.getElementById("separatorInput").value = settings.defaultSeparator || " or ";
    });

    chrome.storage.local.get("selectedText", (result) => {
        const selectedText = result.selectedText || "";
        if (selectedText) {
            extractFromSelectedText(selectedText);
            chrome.storage.local.remove("selectedText");
        }
    });
});

document.getElementById("extractButton").textContent = "Extract and Copy";

document.getElementById("extractButton").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const regexInput = document.getElementById("regexInput").value;
    const separatorInput = document.getElementById("separatorInput").value;

    try {
        new RegExp(regexInput);
        document.getElementById("regexError").style.display = "none";
    } catch (e) {
        document.getElementById("regexError").style.display = "inline";
        return;
    }

    chrome.storage.sync.set({ regex: regexInput, separator: separatorInput });

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

function extractFromSelectedText(selectedText) {
    const regexInput = document.getElementById("regexInput").value;
    const separatorInput = document.getElementById("separatorInput").value;

    try {
        const regex = new RegExp(regexInput, "g");
        const matches = [...selectedText.matchAll(regex)];
        const extractedData = matches.map((match) => match[0]);
        displayResults(extractedData, separatorInput);
    } catch (e) {
        document.getElementById("regexError").style.display = "inline";
    }
}

function displayResults(data, separator) {
    const resultDiv = document.getElementById("result");

    if (data.length > 0) {
        const resultText = data.join(separator);
        resultDiv.textContent = resultText;
        resultDiv.style.display = "block";

        // Automatically copy to clipboard
        navigator.clipboard.writeText(resultText).then(() => {
            // alert("Data copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy data: ", err);
        });
    } else {
        resultDiv.textContent = "No matching data found.";
        resultDiv.style.display = "block";
    }
}
