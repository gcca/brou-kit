export function initSearch()
{
    const input = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const clearBtn = document.getElementById("searchClearBtn");
    const count = document.getElementById("searchCount");

    let activeTabId = null;

    chrome.tabs.query({ active : true, currentWindow : true }, ([ tab ]) => {
        if (tab)
            activeTabId = tab.id;
    });

    function search()
    {
        const query = input.value.trim();
        if (!activeTabId)
            return;

        chrome.tabs.sendMessage(activeTabId, { type : "SEARCH", query }, (response) => {
            if (chrome.runtime.lastError || !response) {
                count.textContent = "Not available — reload the page";
                count.classList.add("search-count-error");
                return;
            }
            count.classList.remove("search-count-error");
            count.textContent = response.count
                ? `${response.count} match${response.count !== 1 ? "es" : ""}`
                : query ? "No matches" : "";
        });
    }

    function clear()
    {
        input.value = "";
        count.textContent = "";
        count.classList.remove("search-count-error");
        if (activeTabId)
            chrome.tabs.sendMessage(activeTabId, { type : "CLEAR_SEARCH" });
    }

    searchBtn.addEventListener("click", search);
    clearBtn.addEventListener("click", clear);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") search(); });
}
