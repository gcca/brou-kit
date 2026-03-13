import { initZoom } from "./zoom.js";
import { initTabs } from "./tabs.js";
import { initSearch } from "./search.js";

function initNav()
{
    const navTabs = document.querySelectorAll(".nav-tab");
    const panels = document.querySelectorAll(".panel");

    function activatePanel(panelId)
    {
        navTabs.forEach((t) => t.classList.toggle("active", t.dataset.panel === panelId));
        panels.forEach((p) => p.classList.toggle("active", p.id === `panel-${panelId}`));
    }

    chrome.storage.local.get(
        "activePanel", ({ activePanel = "zoom" }) => { activatePanel(activePanel); });

    navTabs.forEach((btn) => {
        btn.addEventListener("click", () => {
            activatePanel(btn.dataset.panel);
            chrome.storage.local.set({ activePanel : btn.dataset.panel });
        });
    });
}

initNav();
initZoom();
initTabs();
initSearch();
