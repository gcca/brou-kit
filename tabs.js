export function initTabs()
{
    const tabList = document.getElementById("tabList");

    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            const li = document.createElement("li");
            li.className = "tab-item" + (tab.active ? " current" : "");
            li.title = tab.url;

            if (tab.favIconUrl) {
                const img = document.createElement("img");
                img.className = "tab-favicon";
                img.src = tab.favIconUrl;
                img.onerror = () => img.replaceWith(makeFallbackIcon());
                li.appendChild(img);
            } else {
                li.appendChild(makeFallbackIcon());
            }

            const title = document.createElement("span");
            title.className = "tab-title";
            title.textContent = tab.title || tab.url;
            li.appendChild(title);

            li.addEventListener("click", () => {
                chrome.tabs.update(tab.id, { active : true });
                chrome.windows.update(tab.windowId, { focused : true });
            });

            tabList.appendChild(li);
        }
    });

    function makeFallbackIcon()
    {
        const div = document.createElement("div");
        div.className = "tab-favicon-fallback";
        return div;
    }
}
